import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header, Footer } from 'docx';
import type { ExportTemplate } from '@/components/ExportTemplateManager';

export interface ReportData {
  _id: string;
  title: string;
  report_type: string;
  content: string;
  summary: string;
  highlights: string;
  suggestions: string;
  generated_at: string;
  period_start?: string;
  period_end?: string;
  record_count?: number;
}

export interface BatchExportOptions {
  format: 'pdf' | 'word' | 'markdown';
  template?: ExportTemplate;
  onProgress?: (completed: number, total: number, currentReport: string) => void;
  onError?: (reportId: string, error: Error) => void;
  batchSize?: number;
  delayBetweenExports?: number;
}

export interface BatchExportResult {
  successful: number;
  failed: number;
  errors: Array<{ reportId: string; error: string }>;
}

export class ReportExporter {
  static async exportToPDF(report: ReportData, element?: HTMLElement, template?: ExportTemplate): Promise<void> {
    try {
      let canvas: HTMLCanvasElement;
      
      if (element) {
        // Export from existing HTML element
        canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
        });
      } else {
        // Create a temporary element for export with template
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = template 
          ? this.generateTemplatedReportHTML(report, template)
          : this.generateReportHTML(report);
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.width = '800px';
        tempDiv.style.padding = template ? `${template.styling.margins.top}px` : '40px';
        tempDiv.style.backgroundColor = '#ffffff';
        tempDiv.style.fontFamily = template ? `${template.styling.fontFamily}, system-ui, sans-serif` : 'Inter, system-ui, sans-serif';
        document.body.appendChild(tempDiv);
        
        canvas = await html2canvas(tempDiv, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
        });
        
        document.body.removeChild(tempDiv);
      }

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('PDF export failed:', error);
      throw new Error('Failed to export PDF. Please try again.');
    }
  }

  static async exportToWord(report: ReportData, template?: ExportTemplate): Promise<void> {
    try {
      // Generate header and footer if template is provided
      let header: Header | undefined;
      let footer: Footer | undefined;
      
      if (template?.header.enabled) {
        const headerContent = this.replaceVariables(template.header.content, template.variables);
        header = new Header({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: headerContent,
                  size: template.header.fontSize * 2, // Word uses half-points
                  color: template.header.textColor.replace('#', ''),
                  bold: true,
                }),
                ...(template.header.showDate ? [
                  new TextRun({
                    text: ` | ${new Date().toLocaleDateString()}`,
                    size: template.header.fontSize * 2,
                    color: template.header.textColor.replace('#', ''),
                  })
                ] : [])
              ],
              alignment: template.header.alignment === 'center' ? AlignmentType.CENTER : 
                        template.header.alignment === 'right' ? AlignmentType.RIGHT : AlignmentType.LEFT,
            }),
          ],
        });
      }

      if (template?.footer.enabled) {
        const footerContent = this.replaceVariables(template.footer.content, template.variables);
        footer = new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: footerContent,
                  size: template.footer.fontSize * 2,
                  color: template.footer.textColor.replace('#', ''),
                }),
                ...(template.footer.showPageNumbers ? [
                  new TextRun({
                    text: ' | Page ',
                    size: template.footer.fontSize * 2,
                    color: template.footer.textColor.replace('#', ''),
                  })
                ] : []),
                ...(template.footer.showGeneratedBy ? [
                  new TextRun({
                    text: ` | Generated by ${template.footer.companyName || 'Smart Report Generator'}`,
                    size: template.footer.fontSize * 2,
                    color: template.footer.textColor.replace('#', ''),
                  })
                ] : [])
              ],
              alignment: template.footer.alignment === 'center' ? AlignmentType.CENTER : 
                        template.footer.alignment === 'right' ? AlignmentType.RIGHT : AlignmentType.LEFT,
            }),
          ],
        });
      }

      // Create main content
      const children: Paragraph[] = [];
      
      // Title
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: report.title,
              bold: true,
              size: template ? 32 : 32,
              color: template?.styling.primaryColor.replace('#', '') || "2563eb",
            }),
          ],
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: template?.styling.spacing.sectionGap * 10 || 400 },
        })
      );

      // Report metadata
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Report Type: ${report.report_type}`,
              bold: true,
              size: template ? template.styling.fontSize * 2 : 24,
            }),
            new TextRun({
              text: `\nGenerated: ${new Date(report.generated_at).toLocaleDateString()}`,
              size: template ? template.styling.fontSize * 2 : 24,
            }),
          ],
          spacing: { after: template?.styling.spacing.sectionGap * 10 || 300 },
        })
      );

      // Period information
      if (report.period_start && report.period_end) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Period: ${new Date(report.period_start).toLocaleDateString()} - ${new Date(report.period_end).toLocaleDateString()}`,
                italics: true,
                size: template ? template.styling.fontSize * 2 : 24,
              }),
            ],
            spacing: { after: template?.styling.spacing.sectionGap * 10 || 300 },
          })
        );
      }

      // Add sections based on template configuration
      if (!template || template.sections.showExecutiveSummary) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Executive Summary",
                bold: true,
                size: template?.styling.fontSize ? template.styling.fontSize * 2 + 10 : 28,
                color: template?.styling.secondaryColor.replace('#', '') || "059669",
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { 
              before: template?.styling.spacing.sectionGap * 10 || 400, 
              after: template?.styling.spacing.paragraphGap * 10 || 200 
            },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: report.summary,
                size: template ? template.styling.fontSize * 2 : 24,
              }),
            ],
            spacing: { after: template?.styling.spacing.sectionGap * 10 || 300 },
          })
        );
      }

      if (!template || template.sections.showHighlights) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Key Highlights",
                bold: true,
                size: template?.styling.fontSize ? template.styling.fontSize * 2 + 10 : 28,
                color: template?.styling.secondaryColor.replace('#', '') || "059669",
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { 
              before: template?.styling.spacing.sectionGap * 10 || 400, 
              after: template?.styling.spacing.paragraphGap * 10 || 200 
            },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: report.highlights,
                size: template ? template.styling.fontSize * 2 : 24,
              }),
            ],
            spacing: { after: template?.styling.spacing.sectionGap * 10 || 300 },
          })
        );
      }

      if (!template || template.sections.showDetailedContent) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Detailed Report",
                bold: true,
                size: template?.styling.fontSize ? template.styling.fontSize * 2 + 10 : 28,
                color: template?.styling.secondaryColor.replace('#', '') || "059669",
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { 
              before: template?.styling.spacing.sectionGap * 10 || 400, 
              after: template?.styling.spacing.paragraphGap * 10 || 200 
            },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: report.content,
                size: template ? template.styling.fontSize * 2 : 24,
              }),
            ],
            spacing: { after: template?.styling.spacing.sectionGap * 10 || 300 },
          })
        );
      }

      if (!template || template.sections.showRecommendations) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Recommendations & Next Steps",
                bold: true,
                size: template?.styling.fontSize ? template.styling.fontSize * 2 + 10 : 28,
                color: "dc2626",
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { 
              before: template?.styling.spacing.sectionGap * 10 || 400, 
              after: template?.styling.spacing.paragraphGap * 10 || 200 
            },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: report.suggestions,
                size: template ? template.styling.fontSize * 2 : 24,
              }),
            ],
            spacing: { after: template?.styling.spacing.sectionGap * 10 || 300 },
          })
        );
      }

      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: template ? {
                top: template.styling.margins.top * 56.7, // Convert px to twips
                bottom: template.styling.margins.bottom * 56.7,
                left: template.styling.margins.left * 56.7,
                right: template.styling.margins.right * 56.7,
              } : undefined,
            },
          },
          headers: header ? { default: header } : undefined,
          footers: footer ? { default: footer } : undefined,
          children,
        }],
      });

      const buffer = await Packer.toBuffer(doc);
      const filename = `${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.docx`;
      saveAs(new Blob([buffer]), filename);
    } catch (error) {
      console.error('Word export failed:', error);
      throw new Error('Failed to export Word document. Please try again.');
    }
  }

  static exportToMarkdown(report: ReportData, template?: ExportTemplate): void {
    try {
      const markdown = template 
        ? this.generateTemplatedMarkdown(report, template)
        : this.generateMarkdown(report);
      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
      const filename = `${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
      saveAs(blob, filename);
    } catch (error) {
      console.error('Markdown export failed:', error);
      throw new Error('Failed to export Markdown. Please try again.');
    }
  }

  private static generateTemplatedMarkdown(report: ReportData, template: ExportTemplate): string {
    const periodInfo = report.period_start && report.period_end 
      ? `**Period:** ${new Date(report.period_start).toLocaleDateString()} - ${new Date(report.period_end).toLocaleDateString()}\n\n`
      : '';

    let markdown = '';

    // Header
    if (template.header.enabled) {
      const headerContent = this.replaceVariables(template.header.content, template.variables);
      const headerWithDate = template.header.showDate 
        ? `${headerContent} | ${new Date().toLocaleDateString()}`
        : headerContent;
      markdown += `---\n**${headerWithDate}**\n---\n\n`;
    }

    // Title
    markdown += `# ${report.title}\n\n`;

    // Metadata
    markdown += `**Report Type:** ${report.report_type}  \n`;
    markdown += `**Generated:** ${new Date(report.generated_at).toLocaleDateString()}  \n`;
    if (periodInfo) {
      markdown += periodInfo;
    }
    markdown += '\n';

    // Sections based on template configuration
    if (template.sections.showExecutiveSummary) {
      markdown += `## Executive Summary\n\n${report.summary}\n\n`;
    }

    if (template.sections.showHighlights) {
      markdown += `## Key Highlights\n\n${report.highlights}\n\n`;
    }

    if (template.sections.showDetailedContent) {
      markdown += `## Detailed Report\n\n${report.content}\n\n`;
    }

    if (template.sections.showRecommendations) {
      markdown += `## Recommendations & Next Steps\n\n${report.suggestions}\n\n`;
    }

    // Custom sections
    template.sections.customSections
      .sort((a, b) => a.order - b.order)
      .forEach(section => {
        markdown += `## ${section.title}\n\n${section.content}\n\n`;
      });

    // Footer
    if (template.footer.enabled) {
      markdown += '---\n';
      const footerContent = this.replaceVariables(template.footer.content, template.variables);
      markdown += `*${footerContent}`;
      
      if (template.footer.showGeneratedBy) {
        const company = template.footer.companyName || 'Smart Report Generator';
        markdown += ` | Generated by ${company}`;
      }
      
      markdown += '*\n';
    } else {
      markdown += '---\n*Generated by Smart Report Generator*\n';
    }

    return markdown;
  }

  private static generateTemplatedReportHTML(report: ReportData, template: ExportTemplate): string {
    const periodInfo = report.period_start && report.period_end 
      ? `<p style="color: #6b7280; font-style: italic; margin-bottom: ${template.styling.spacing.paragraphGap}px;">
         Period: ${new Date(report.period_start).toLocaleDateString()} - ${new Date(report.period_end).toLocaleDateString()}
         </p>`
      : '';

    let headerHtml = '';
    if (template.header.enabled) {
      const headerContent = this.replaceVariables(template.header.content, template.variables);
      const headerWithDate = template.header.showDate 
        ? `${headerContent} | ${new Date().toLocaleDateString()}`
        : headerContent;
      
      headerHtml = `
        <div style="
          background-color: ${template.header.backgroundColor};
          color: ${template.header.textColor};
          height: ${template.header.height}px;
          display: flex;
          align-items: center;
          justify-content: ${template.header.alignment};
          padding: 0 ${template.styling.margins.left}px;
          font-size: ${template.header.fontSize}px;
          font-weight: bold;
          margin-bottom: ${template.styling.spacing.sectionGap}px;
        ">
          ${headerWithDate}
        </div>
      `;
    }

    let footerHtml = '';
    if (template.footer.enabled) {
      const footerContent = this.replaceVariables(template.footer.content, template.variables);
      let footerText = footerContent;
      
      if (template.footer.showPageNumbers) {
        footerText += ' | Page 1';
      }
      
      if (template.footer.showGeneratedBy) {
        const company = template.footer.companyName || 'Smart Report Generator';
        footerText += ` | Generated by ${company}`;
      }
      
      footerHtml = `
        <div style="
          background-color: ${template.footer.backgroundColor};
          color: ${template.footer.textColor};
          height: ${template.footer.height}px;
          display: flex;
          align-items: center;
          justify-content: ${template.footer.alignment};
          padding: 0 ${template.styling.margins.left}px;
          font-size: ${template.footer.fontSize}px;
          margin-top: ${template.styling.spacing.sectionGap}px;
          border-top: 1px solid #e5e7eb;
        ">
          ${footerText}
        </div>
      `;
    }

    let sectionsHtml = '';
    
    // Title
    sectionsHtml += `
      <h1 style="
        color: ${template.styling.primaryColor}; 
        text-align: center; 
        margin-bottom: ${template.styling.spacing.sectionGap}px; 
        font-size: ${Math.max(24, template.styling.fontSize + 10)}px; 
        font-weight: bold;
      ">
        ${report.title}
      </h1>
    `;

    // Metadata
    sectionsHtml += `
      <div style="
        margin-bottom: ${template.styling.spacing.sectionGap}px; 
        padding: ${template.styling.spacing.paragraphGap}px; 
        background: #f8fafc; 
        border-radius: 8px;
      ">
        <p style="margin: 0; color: #374151; font-size: ${template.styling.fontSize}px;">
          <strong>Report Type:</strong> ${report.report_type}
        </p>
        <p style="margin: ${template.styling.spacing.paragraphGap / 2}px 0 0 0; color: #374151; font-size: ${template.styling.fontSize}px;">
          <strong>Generated:</strong> ${new Date(report.generated_at).toLocaleDateString()}
        </p>
      </div>
    `;

    if (periodInfo) {
      sectionsHtml += periodInfo;
    }

    // Content sections
    if (template.sections.showExecutiveSummary) {
      sectionsHtml += `
        <h2 style="
          color: ${template.styling.secondaryColor}; 
          margin: ${template.styling.spacing.sectionGap}px 0 ${template.styling.spacing.paragraphGap}px 0; 
          font-size: ${template.styling.fontSize + 6}px; 
          font-weight: bold;
        ">
          Executive Summary
        </h2>
        <div style="margin-bottom: ${template.styling.spacing.sectionGap}px; color: #374151; font-size: ${template.styling.fontSize}px; line-height: ${template.styling.lineHeight};">
          ${report.summary}
        </div>
      `;
    }

    if (template.sections.showHighlights) {
      sectionsHtml += `
        <h2 style="
          color: ${template.styling.secondaryColor}; 
          margin: ${template.styling.spacing.sectionGap}px 0 ${template.styling.spacing.paragraphGap}px 0; 
          font-size: ${template.styling.fontSize + 6}px; 
          font-weight: bold;
        ">
          Key Highlights
        </h2>
        <div style="margin-bottom: ${template.styling.spacing.sectionGap}px; color: #374151; font-size: ${template.styling.fontSize}px; line-height: ${template.styling.lineHeight};">
          ${report.highlights}
        </div>
      `;
    }

    if (template.sections.showDetailedContent) {
      sectionsHtml += `
        <h2 style="
          color: ${template.styling.secondaryColor}; 
          margin: ${template.styling.spacing.sectionGap}px 0 ${template.styling.spacing.paragraphGap}px 0; 
          font-size: ${template.styling.fontSize + 6}px; 
          font-weight: bold;
        ">
          Detailed Report
        </h2>
        <div style="margin-bottom: ${template.styling.spacing.sectionGap}px; color: #374151; font-size: ${template.styling.fontSize}px; line-height: ${template.styling.lineHeight};">
          ${report.content}
        </div>
      `;
    }

    if (template.sections.showRecommendations) {
      sectionsHtml += `
        <h2 style="
          color: #dc2626; 
          margin: ${template.styling.spacing.sectionGap}px 0 ${template.styling.spacing.paragraphGap}px 0; 
          font-size: ${template.styling.fontSize + 6}px; 
          font-weight: bold;
        ">
          Recommendations & Next Steps
        </h2>
        <div style="margin-bottom: ${template.styling.spacing.sectionGap}px; color: #374151; font-size: ${template.styling.fontSize}px; line-height: ${template.styling.lineHeight};">
          ${report.suggestions}
        </div>
      `;
    }

    // Custom sections
    template.sections.customSections
      .sort((a, b) => a.order - b.order)
      .forEach(section => {
        sectionsHtml += `
          <h2 style="
            color: ${template.styling.secondaryColor}; 
            margin: ${template.styling.spacing.sectionGap}px 0 ${template.styling.spacing.paragraphGap}px 0; 
            font-size: ${template.styling.fontSize + 6}px; 
            font-weight: bold;
          ">
            ${section.title}
          </h2>
          <div style="margin-bottom: ${template.styling.spacing.sectionGap}px; color: #374151; font-size: ${template.styling.fontSize}px; line-height: ${template.styling.lineHeight};">
            ${section.content}
          </div>
        `;
      });

    return `
      <div style="
        max-width: 800px; 
        margin: 0 auto; 
        padding: ${template.styling.margins.top}px ${template.styling.margins.right}px ${template.styling.margins.bottom}px ${template.styling.margins.left}px; 
        background: white; 
        font-family: ${template.styling.fontFamily}, system-ui, sans-serif; 
        font-size: ${template.styling.fontSize}px;
        line-height: ${template.styling.lineHeight};
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      ">
        ${headerHtml}
        
        <div style="flex: 1;">
          ${sectionsHtml}
        </div>
        
        ${footerHtml}
      </div>
    `;
  }

  private static replaceVariables(content: string, variables: ExportTemplate['variables']): string {
    let result = content;
    variables.forEach(variable => {
      const placeholder = `{${variable.name}}`;
      result = result.replace(new RegExp(placeholder, 'g'), variable.defaultValue);
    });
    return result;
  }

  private static generateMarkdown(report: ReportData): string {
    const periodInfo = report.period_start && report.period_end 
      ? `**Period:** ${new Date(report.period_start).toLocaleDateString()} - ${new Date(report.period_end).toLocaleDateString()}\n\n`
      : '';

    return `# ${report.title}

**Report Type:** ${report.report_type}  
**Generated:** ${new Date(report.generated_at).toLocaleDateString()}  
${periodInfo}

## Executive Summary

${report.summary}

## Key Highlights

${report.highlights}

## Detailed Report

${report.content}

## Recommendations & Next Steps

${report.suggestions}

---
*Generated by Smart Report Generator*
`;
  }

  private static generateReportHTML(report: ReportData): string {
    const periodInfo = report.period_start && report.period_end 
      ? `<p style="color: #6b7280; font-style: italic; margin-bottom: 24px;">
         Period: ${new Date(report.period_start).toLocaleDateString()} - ${new Date(report.period_end).toLocaleDateString()}
         </p>`
      : '';

    return `
      <div style="max-width: 800px; margin: 0 auto; padding: 40px; background: white; font-family: Inter, system-ui, sans-serif; line-height: 1.6;">
        <h1 style="color: #2563eb; text-align: center; margin-bottom: 32px; font-size: 28px; font-weight: bold;">${report.title}</h1>
        
        <div style="margin-bottom: 32px; padding: 16px; background: #f8fafc; border-radius: 8px;">
          <p style="margin: 0; color: #374151;"><strong>Report Type:</strong> ${report.report_type}</p>
          <p style="margin: 8px 0 0 0; color: #374151;"><strong>Generated:</strong> ${new Date(report.generated_at).toLocaleDateString()}</p>
        </div>
        
        ${periodInfo}
        
        <h2 style="color: #059669; margin: 32px 0 16px 0; font-size: 20px; font-weight: bold;">Executive Summary</h2>
        <div style="margin-bottom: 32px; color: #374151;">${report.summary}</div>
        
        <h2 style="color: #059669; margin: 32px 0 16px 0; font-size: 20px; font-weight: bold;">Key Highlights</h2>
        <div style="margin-bottom: 32px; color: #374151;">${report.highlights}</div>
        
        <h2 style="color: #059669; margin: 32px 0 16px 0; font-size: 20px; font-weight: bold;">Detailed Report</h2>
        <div style="margin-bottom: 32px; color: #374151;">${report.content}</div>
        
        <h2 style="color: #dc2626; margin: 32px 0 16px 0; font-size: 20px; font-weight: bold;">Recommendations & Next Steps</h2>
        <div style="margin-bottom: 32px; color: #374151;">${report.suggestions}</div>
        
        <hr style="margin: 40px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="text-align: center; color: #6b7280; font-size: 14px; font-style: italic;">Generated by Smart Report Generator</p>
      </div>
    `;
  }

  /**
   * Batch export multiple reports with progress tracking and error handling
   */
  static async batchExport(
    reports: ReportData[], 
    options: BatchExportOptions
  ): Promise<BatchExportResult> {
    const {
      format,
      template,
      onProgress,
      onError,
      batchSize = 5,
      delayBetweenExports = 500
    } = options;

    const result: BatchExportResult = {
      successful: 0,
      failed: 0,
      errors: []
    };

    // Process reports in batches to avoid overwhelming the system
    for (let i = 0; i < reports.length; i += batchSize) {
      const batch = reports.slice(i, i + batchSize);
      
      // Process batch concurrently
      const batchPromises = batch.map(async (report, batchIndex) => {
        const globalIndex = i + batchIndex;
        
        try {
          // Add delay between exports to prevent system overload
          if (globalIndex > 0 && delayBetweenExports > 0) {
            await new Promise(resolve => setTimeout(resolve, delayBetweenExports));
          }

          onProgress?.(globalIndex, reports.length, report.title);

          switch (format) {
            case 'pdf':
              await this.exportToPDF(report, undefined, template);
              break;
            case 'word':
              await this.exportToWord(report, template);
              break;
            case 'markdown':
              this.exportToMarkdown(report, template);
              break;
            default:
              throw new Error(`Unsupported format: ${format}`);
          }

          result.successful++;
          onProgress?.(globalIndex + 1, reports.length, report.title);

        } catch (error) {
          console.error(`Batch export failed for report ${report.title}:`, error);
          
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          result.failed++;
          result.errors.push({
            reportId: report._id,
            error: errorMessage
          });

          onError?.(report._id, error instanceof Error ? error : new Error(errorMessage));
        }
      });

      // Wait for current batch to complete before starting next batch
      await Promise.all(batchPromises);
    }

    return result;
  }

  /**
   * Generate a combined report from multiple reports
   */
  static async exportCombinedReport(
    reports: ReportData[],
    format: 'pdf' | 'word' | 'markdown',
    title = 'Combined Report',
    template?: ExportTemplate
  ): Promise<void> {
    const combinedReport: ReportData = {
      _id: 'combined-' + Date.now(),
      title,
      report_type: 'combined',
      content: this.generateCombinedContent(reports),
      summary: this.generateCombinedSummary(reports),
      highlights: this.generateCombinedHighlights(reports),
      suggestions: this.generateCombinedSuggestions(reports),
      generated_at: new Date().toISOString(),
      period_start: reports.length > 0 ? this.getEarliestDate(reports) : undefined,
      period_end: reports.length > 0 ? this.getLatestDate(reports) : undefined,
    };

    switch (format) {
      case 'pdf':
        await this.exportToPDF(combinedReport, undefined, template);
        break;
      case 'word':
        await this.exportToWord(combinedReport, template);
        break;
      case 'markdown':
        this.exportToMarkdown(combinedReport, template);
        break;
    }
  }

  /**
   * Get estimated export time for batch processing
   */
  static getEstimatedBatchTime(reportCount: number, format: 'pdf' | 'word' | 'markdown'): number {
    const baseTimePerReport = {
      pdf: 3000,      // 3 seconds per PDF
      word: 1500,     // 1.5 seconds per Word doc
      markdown: 100   // 0.1 seconds per Markdown
    };

    const delayTime = 500; // 0.5 seconds delay between exports
    return (baseTimePerReport[format] + delayTime) * reportCount;
  }

  /**
   * Validate reports before batch export
   */
  static validateReportsForExport(reports: ReportData[]): string[] {
    const errors: string[] = [];

    if (reports.length === 0) {
      errors.push('No reports selected for export');
    }

    if (reports.length > 50) {
      errors.push('Too many reports selected. Maximum 50 reports allowed per batch');
    }

    reports.forEach((report, index) => {
      if (!report.title?.trim()) {
        errors.push(`Report ${index + 1} has no title`);
      }
      
      if (!report.content?.trim()) {
        errors.push(`Report "${report.title}" has no content`);
      }
    });

    return errors;
  }

  private static generateCombinedContent(reports: ReportData[]): string {
    return reports.map((report, index) => {
      return `## Report ${index + 1}: ${report.title}

**Type:** ${report.report_type}
**Generated:** ${new Date(report.generated_at).toLocaleDateString()}

### Summary
${report.summary}

### Key Highlights
${report.highlights}

### Content
${report.content}

### Suggestions
${report.suggestions}

---

`;
    }).join('\n');
  }

  private static generateCombinedSummary(reports: ReportData[]): string {
    return `This combined report includes ${reports.length} individual reports covering various periods and activities. Each report has been analyzed and compiled with AI-generated insights and recommendations.`;
  }

  private static generateCombinedHighlights(reports: ReportData[]): string {
    const allHighlights = reports
      .map(report => {
        try {
          return typeof report.highlights === 'string' ? JSON.parse(report.highlights) : report.highlights;
        } catch {
          return [report.highlights];
        }
      })
      .flat()
      .filter(Boolean);

    // Take top highlights (limit to avoid overwhelming)
    return JSON.stringify(allHighlights.slice(0, 10));
  }

  private static generateCombinedSuggestions(reports: ReportData[]): string {
    const suggestions = reports
      .map(report => report.suggestions)
      .filter(Boolean)
      .join('\n\n');

    return `Based on analysis of ${reports.length} reports:\n\n${suggestions}`;
  }

  private static getEarliestDate(reports: ReportData[]): string {
    const dates = reports
      .map(report => report.period_start || report.generated_at)
      .filter(Boolean)
      .map(date => new Date(date));

    return new Date(Math.min(...dates.map(d => d.getTime()))).toISOString();
  }

  private static getLatestDate(reports: ReportData[]): string {
    const dates = reports
      .map(report => report.period_end || report.generated_at)
      .filter(Boolean)
      .map(date => new Date(date));

    return new Date(Math.max(...dates.map(d => d.getTime()))).toISOString();
  }
}