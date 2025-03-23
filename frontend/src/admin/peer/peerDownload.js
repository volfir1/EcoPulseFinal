import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Update these paths to match your project structure
import companyLogo from '@assets/images/logo.png';
import schoolLogo from '@assets/images/tup_logo.png';

/**
 * Generates and downloads a PDF report for peer-to-peer energy data
 * 
 * @param {Array} data - Energy data to include in report
 * @returns {Promise<boolean>} Success status of export operation
 */
export const exportPeerToPeerPDF = async (data) => {
  try {
    // Create new PDF document
    const doc = new jsPDF({
      orientation: 'landscape', // Use landscape for wider tables
      unit: 'mm',
      format: 'a4'
    });

    // Document dimensions for reference
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Header background
    const headerHeight = 30;
    doc.setFillColor(66, 139, 202); // Blue theme
    doc.rect(0, 0, pageWidth, headerHeight, 'F');

    // Add logos
    doc.addImage(companyLogo, 'PNG', 15, 5, 20, 20);
    doc.addImage(schoolLogo, 'PNG', pageWidth - 35, 5, 20, 20);
    
    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    
    const titleText = 'Peer-to-Peer Energy Data Report';
    const titleWidth = doc.getStringUnitWidth(titleText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    const titleX = (pageWidth - titleWidth) / 2;
    doc.text(titleText, titleX, 17);

    // Date
    doc.setFontSize(11);
    const dateText = `Date Generated: ${new Date().toLocaleDateString()}`;
    const dateWidth = doc.getStringUnitWidth(dateText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    const dateX = (pageWidth - dateWidth) / 2;
    doc.text(dateText, dateX, 25);

    doc.setTextColor(0, 0, 0);
    let yPosition = headerHeight + 15;

    // Regional Energy Production chart title
    doc.setFontSize(14);
    const tableTitleText = "Regional Energy Production Summary";
    const tableTitleWidth = doc.getStringUnitWidth(tableTitleText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    const tableTitleX = (pageWidth - tableTitleWidth) / 2;
    doc.text(tableTitleText, tableTitleX, yPosition);
    yPosition += 8;

    // Table with region data
    doc.autoTable({
      head: [
        ['Year', 'Cebu', 'Negros', 'Panay', 'Leyte-Samar', 'Bohol', 'Visayas Total', 'Visayas Consumption']
      ],
      body: data.map(item => [
        item.year,
        parseFloat(item.cebuTotal).toFixed(2),
        parseFloat(item.negrosTotal).toFixed(2),
        parseFloat(item.panayTotal).toFixed(2),
        parseFloat(item.leyteSamarTotal).toFixed(2),
        parseFloat(item.boholTotal).toFixed(2),
        parseFloat(item.visayasTotal).toFixed(2),
        parseFloat(item.visayasConsumption).toFixed(2)
      ]),
      startY: yPosition,
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
      headStyles: {
        fillColor: [66, 139, 202],
        halign: 'center',
        fontSize: 11
      },
      columnStyles: {
        0: { cellWidth: 25, halign: 'center' },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 30, halign: 'center' },
        4: { cellWidth: 35, halign: 'center' },
        5: { cellWidth: 30, halign: 'center' },
        6: { cellWidth: 35, halign: 'center' },
        7: { cellWidth: 40, halign: 'center' }
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
        overflow: 'linebreak'
      },
      alternateRowStyles: {
        fillColor: [235, 244, 250]
      }
    });
    
    // Add a second page for solar cost and other data if needed
    doc.addPage();
    
    // Title for second page
    doc.setFillColor(66, 139, 202);
    doc.rect(0, 0, pageWidth, headerHeight, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    const page2Title = "Energy Supply & Demand Analysis";
    const page2TitleWidth = doc.getStringUnitWidth(page2Title) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    const page2TitleX = (pageWidth - page2TitleWidth) / 2;
    doc.text(page2Title, page2TitleX, 17);
    doc.setFontSize(11);
    doc.text(dateText, dateX, 25);
    
    // Reset position for second page
    yPosition = headerHeight + 15;
    doc.setTextColor(0, 0, 0);
    
    // Add production vs consumption analysis header
    doc.setFontSize(14);
    doc.text("Regional Production vs. Consumption Analysis", 15, yPosition);
    yPosition += 10;
    
    // Add a table for production vs consumption comparison
    const consumptionData = data.map(item => {
      const surplus = item.visayasTotal - item.visayasConsumption;
      const surplusPercent = item.visayasConsumption > 0 ? (surplus / item.visayasConsumption * 100) : 0;
      return [
        item.year,
        parseFloat(item.visayasTotal).toFixed(2),
        parseFloat(item.visayasConsumption).toFixed(2),
        parseFloat(surplus).toFixed(2),
        `${surplusPercent.toFixed(1)}%`,
        surplus > 0 ? "Surplus" : "Deficit"
      ];
    });
    
    doc.autoTable({
      head: [
        ['Year', 'Total Production (GWh)', 'Consumption (GWh)', 'Difference (GWh)', 'Difference (%)', 'Status']
      ],
      body: consumptionData,
      startY: yPosition,
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
      headStyles: {
        fillColor: [66, 139, 202],
        halign: 'center',
        fontSize: 11
      },
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 25, halign: 'center' },
        1: { cellWidth: 40, halign: 'center' },
        2: { cellWidth: 40, halign: 'center' },
        3: { cellWidth: 35, halign: 'center' },
        4: { cellWidth: 30, halign: 'center' },
        5: { cellWidth: 25, halign: 'center' }
      },
      alternateRowStyles: {
        fillColor: [235, 244, 250]
      },
      didDrawCell: (data) => {
        // Color the "Status" cell based on Surplus/Deficit
        if (data.section === 'body' && data.column.index === 5) {
          const cell = data.cell;
          const text = cell.raw;
          if (text === 'Surplus') {
            doc.setFillColor(200, 250, 200); // Light green for surplus
            doc.rect(cell.x, cell.y, cell.width, cell.height, 'F');
            doc.setTextColor(0, 100, 0); // Dark green text
            doc.text(text, cell.x + cell.width / 2, cell.y + cell.height / 2, { align: 'center', baseline: 'middle' });
            doc.setTextColor(0, 0, 0); // Reset text color
            return false; // Don't draw the default cell content
          } else if (text === 'Deficit') {
            doc.setFillColor(250, 200, 200); // Light red for deficit
            doc.rect(cell.x, cell.y, cell.width, cell.height, 'F');
            doc.setTextColor(150, 0, 0); // Dark red text
            doc.text(text, cell.x + cell.width / 2, cell.y + cell.height / 2, { align: 'center', baseline: 'middle' });
            doc.setTextColor(0, 0, 0); // Reset text color
            return false; // Don't draw the default cell content
          }
        }
      }
    });
    
    // Get new Y position after the table
    yPosition = doc.autoTable.previous.finalY + 20;
    
    // Add regional insights section
    doc.setFontSize(14);
    doc.text("Regional Insights", 15, yPosition);
    yPosition += 8;
    
    // Add insights in bullet points
    doc.setFontSize(10);
    
    const insights = [
      "The Visayas region shows an overall trend of increased energy production across all provinces.",
      "Negros consistently produces the highest renewable energy percentage in the region.",
      "Leyte-Samar has significant geothermal capacity contributing to overall production.",
      "Consumption patterns indicate growing demand throughout the Visayas region.",
      "Peer-to-peer energy trading opportunities exist in areas with production surplus."
    ];
    
    insights.forEach((insight, index) => {
      // Draw bullet point
      doc.setFillColor(66, 139, 202);
      doc.circle(20, yPosition + 1.5, 1.5, 'F');
      
      // Draw text with multi-line support if needed
      const lines = doc.splitTextToSize(insight, pageWidth - 45);
      doc.text(lines, 25, yPosition);
      yPosition += (lines.length * 6);
    });
    
    // Footer
    yPosition = pageHeight - 20;
    
    // Footer line
    doc.setDrawColor(66, 139, 202);
    doc.setLineWidth(0.5);
    doc.line(15, yPosition - 10, pageWidth - 15, yPosition - 10);
    
    // Footer logo
    doc.addImage(companyLogo, 'PNG', 15, yPosition - 7, 12, 12);
    
    // Contact information
    doc.setFontSize(8);
    const contactText = "Ecopulse Energy Management | Phone: +63 2 1234 5678 | Email: info@ecopulse.com";
    doc.text(contactText, pageWidth / 2, yPosition - 4, { align: 'center' });
    
    // Copyright
    doc.setFontSize(7);
    const copyrightText = `© ${new Date().getFullYear()} Ecopulse. All rights reserved.`;
    doc.text(copyrightText, pageWidth / 2, yPosition, { align: 'center' });
    
    // Save the PDF
    doc.save(`Peer-to-Peer_Energy_Report_${new Date().getFullYear()}.pdf`);
    
    return true;
  } catch (error) {
    console.error('Export error:', error);
    return false;
  }
};

export default exportPeerToPeerPDF; 