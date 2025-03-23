import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Update these paths to match your project structure
import companyLogo from '@assets/images/logo.png';
import schoolLogo from '@assets/images/tup_logo.png';

export const exportRecommendationPDF = async (data) => {
  try {
    // Create new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Document dimensions for reference
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Header background
    const headerHeight = 30;
    doc.setFillColor(22, 163, 74);
    doc.rect(0, 0, pageWidth, headerHeight, 'F');

    // Add logos
    doc.addImage(companyLogo, 'PNG', 15, 5, 20, 20);
    doc.addImage(schoolLogo, 'PNG', pageWidth - 35, 5, 20, 20);
    
    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    
    const titleText = 'Ecopulse Energy Recommendations';
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

    // Table title
    doc.setFontSize(14);
    const tableTitleText = "Recommendation Parameters";
    const tableTitleWidth = doc.getStringUnitWidth(tableTitleText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    const tableTitleX = (pageWidth - tableTitleWidth) / 2;
    doc.text(tableTitleText, tableTitleX, yPosition);
    yPosition += 8;

    // Table with data
    doc.autoTable({
      head: [['Year', 'Solar Cost (PHP/W)', 'MERALCO Rate (PHP/kWh)']],
      body: data.map(item => [
        item.year, 
        parseFloat(item.solarCost).toFixed(2), 
        parseFloat(item.meralcoRate).toFixed(2)
      ]),
      startY: yPosition,
      margin: { left: 30, right: 30 },
      headStyles: { 
        fillColor: [22, 163, 74],
        halign: 'center',
        fontSize: 11
      },
      columnStyles: {
        0: { cellWidth: 40, halign: 'center' },
        1: { cellWidth: 60, halign: 'center' },
        2: { cellWidth: 60, halign: 'center' }
      },
      styles: { 
        fontSize: 10, 
        cellPadding: 5,
        overflow: 'linebreak'
      },
      alternateRowStyles: {
        fillColor: [240, 248, 240]
      }
    });
    
    // Footer
    yPosition = doc.autoTable.previous.finalY + 15;
    
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Footer line
    doc.setDrawColor(22, 163, 74);
    doc.setLineWidth(0.5);
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 10;
    
    // Footer logo
    doc.addImage(companyLogo, 'PNG', 15, yPosition, 15, 15);
    
    // Contact information
    doc.setFontSize(8);
    const contactText = "Phone: +63 2 1234 5678 | Email: info@ecopulse.com | Website: www.ecopulse.com";
    const contactWidth = doc.getStringUnitWidth(contactText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    const contactX = (pageWidth - contactWidth) / 2;
    doc.text(contactText, contactX, yPosition + 5);
    
    // Copyright
    yPosition += 10;
    doc.setFontSize(7);
    const copyrightText = `© ${new Date().getFullYear()} Ecopulse. All rights reserved.`;
    const copyrightWidth = doc.getStringUnitWidth(copyrightText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    const copyrightX = (pageWidth - copyrightWidth) / 2;
    doc.text(copyrightText, copyrightX, yPosition);
    
    // Save the PDF
    doc.save(`Energy_Recommendations_${new Date().getFullYear()}.pdf`);
    
    return true;
  } catch (error) {
    console.error('Export error:', error);
    return false;
  }
};

export default exportRecommendationPDF;