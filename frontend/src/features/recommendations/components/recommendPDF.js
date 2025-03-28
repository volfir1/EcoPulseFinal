import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

// Import your logo files (adjust paths as needed)
import companyLogo from '@assets/images/logo.png';
import schoolLogo from '@assets/images/tup_logo.png';

/**
 * Generates and downloads a PDF report for energy recommendations
 * @param {Object} data - The data to include in the PDF
 * @param {Object} refs - References to chart elements
 * @param {Function} toast - Toast notification function
 */
export const generateRecommendationsPDF = async (data, refs, toast) => {
  try {
    // Show loading toast
    toast.info('Preparing your PDF download...');
    
    // Create new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Document dimensions for reference
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15; // Standard margin for all sections
    const contentWidth = pageWidth - (margin * 2); // Available content width
    
    // Define colors for consistent branding
    const colors = {
      primary: [22, 163, 74], // Green
      secondary: [255, 184, 0], // Yellow/Gold
      accent: [59, 130, 246], // Blue
      light: [249, 250, 251], // Light gray
      dark: [31, 41, 55] // Dark gray
    };
    
    // Define section spacing
    const sectionSpacing = 15;
    
    // 1) HEADER BACKGROUND
    const headerHeight = 35;
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, pageWidth, headerHeight, 'F');

    // 2) ADD LOGOS
    const logoSize = 20;
    // Add company logo on the left
    doc.addImage(companyLogo, 'PNG', margin, (headerHeight - logoSize) / 2, logoSize, logoSize);
    
    // Add school logo on the right
    doc.addImage(schoolLogo, 'PNG', pageWidth - margin - logoSize, (headerHeight - logoSize) / 2, logoSize, logoSize);

    // 3) HEADER TEXT - CENTERED
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    
    // Center the title
    const titleText = 'ENERGY RECOMMENDATIONS';
    const titleWidth = doc.getStringUnitWidth(titleText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    const titleX = (pageWidth - titleWidth) / 2;
    doc.text(titleText, titleX, headerHeight / 2 + 3);
    doc.setFont(undefined, 'normal');

    // 4) DATE - RIGHT ALIGNED BELOW HEADER
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    const dateText = `Generated: ${new Date().toLocaleDateString()}`;
    doc.text(dateText, pageWidth - margin - 2, headerHeight - 5);

    // 5) SWITCH BACK TO BLACK TEXT AFTER HEADER
    doc.setTextColor(0, 0, 0);
    
    // 6) SUMMARY BOX WITH KEY METRICS - IMPROVED 2-COLUMN LAYOUT
    let yPosition = headerHeight + 12;
    
    // Summary box with enhanced styling
    doc.setFillColor(240, 249, 244); // Light green background
    doc.roundedRect(margin, yPosition, contentWidth, 30, 3, 3, 'F');
    
    // Adjust to 2 columns instead of 3
    const colWidth = contentWidth / 2;
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(0.5);
    doc.line(margin + colWidth, yPosition + 5, margin + colWidth, yPosition + 25);
    
    // Column 1: Budget - centered content and improved style
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.text("BUDGET", margin + colWidth/2, yPosition + 10, { align: 'center' });
    doc.setFont(undefined, 'normal');
    doc.setFontSize(14);
    doc.text(`₱${data.budget.toLocaleString()}`, margin + colWidth/2, yPosition + 20, { align: 'center' });
    
    // Column 2: Investment Year - centered content and improved style
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.text("INVESTMENT YEAR", margin + colWidth + colWidth/2, yPosition + 10, { align: 'center' });
    doc.setFont(undefined, 'normal');
    doc.setFontSize(14);
    doc.text(`${data.year}`, margin + colWidth + colWidth/2, yPosition + 20, { align: 'center' });
    
    yPosition += 30 + 10; // Box height + spacing
    
    // 7) RENEWABLE ENERGY POTENTIAL SECTION - IMPROVED STYLING
    // Section title with gradient-like effect
    doc.setFillColor(...colors.primary);
    doc.roundedRect(margin, yPosition, contentWidth, 10, 3, 3, 'F');
    // Add a subtle secondary color accent bar
    doc.setFillColor(...colors.secondary);
    doc.roundedRect(margin, yPosition, 5, 10, 3, 0, 'F');
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text('RENEWABLE ENERGY POTENTIAL', margin + 12, yPosition + 6.5);
    doc.setTextColor(0, 0, 0);
    yPosition += 14;
    
    // Content box with improved styling
    doc.setFillColor(255, 250, 240); // Light yellow background
    doc.roundedRect(margin, yPosition, contentWidth, 30, 2, 2, 'F');
    
    // Enhanced solar icon with outline
    doc.setFillColor(...colors.secondary);
    doc.circle(margin + 15, yPosition + 15, 6, 'F');
    doc.setDrawColor(200, 150, 0);
    doc.circle(margin + 15, yPosition + 15, 6.5, 'S');
    
    // Solar content with improved layout
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text('Solar Energy', margin + 30, yPosition + 12);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Potential: ${data.solarPotential}`, margin + 30, yPosition + 20);
    doc.text('Average 5.5 kWh/m²/day', margin + 30, yPosition + 26);
    
    yPosition += 30 + sectionSpacing;
    
    // 8) FUTURE PROJECTIONS SECTION - IMPROVED STYLING
    // Section title with accent bar
    doc.setFillColor(...colors.accent);
    doc.roundedRect(margin, yPosition, contentWidth, 10, 3, 3, 'F');
    doc.setFillColor(...colors.secondary);
    doc.roundedRect(margin, yPosition, 5, 10, 3, 0, 'F');
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text('FUTURE PROJECTIONS', margin + 12, yPosition + 6.5);
    doc.setTextColor(0, 0, 0);
    yPosition += 14;
    
    // Add table for future projections
    const projectionData = [];
    if (data.futureProjections) {
      Object.entries(data.futureProjections)
        .filter(([key]) => !['year', 'title'].includes(key))
        .forEach(([key, value]) => {
          projectionData.push([key, value]);
        });
    }
    
    // Year and title above the table, if available
    if (data.futureProjections && data.futureProjections.year && data.futureProjections.title) {
      doc.setFillColor(240, 249, 255); // Light blue
      doc.roundedRect(margin, yPosition, contentWidth, 12, 2, 2, 'F');
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text(`${data.futureProjections.year}`, margin + 6, yPosition + 5);
      doc.setFont(undefined, 'normal');
      doc.text(`${data.futureProjections.title}`, margin + 30, yPosition + 8);
      
      yPosition += 16;
    }
    
    // Projection data table
    doc.autoTable({
      head: [['Metric', 'Value']],
      body: projectionData,
      startY: yPosition,
      theme: 'grid',
      styles: { 
        fontSize: 9, 
        cellPadding: 4,
        lineColor: [220, 220, 220],
        lineWidth: 0.1
      },
      headStyles: { 
        fillColor: colors.accent, 
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 110 },
        1: { cellWidth: 60, halign: 'right' }
      },
      margin: { left: margin, right: margin },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      }
    });
    
    yPosition = doc.autoTable.previous.finalY + sectionSpacing;
    
    // 9) ENERGY PRODUCTION SECTION - IMPROVED STYLING
    // Check if we need a page break
    if (yPosition > pageHeight - 100) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Section title with accent bar
    doc.setFillColor(...colors.secondary);
    doc.roundedRect(margin, yPosition, contentWidth, 10, 3, 3, 'F');
    doc.setFillColor(...colors.primary);
    doc.roundedRect(margin, yPosition, 5, 10, 3, 0, 'F');
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text('ESTIMATED YEARLY ENERGY PRODUCTION', margin + 12, yPosition + 6.5);
    doc.setTextColor(0, 0, 0);
    yPosition += 14;
    
    // Try to capture the energy production chart/content
    if (refs && refs.chartRef && refs.chartRef.current) {
      try {
        const chartElement = refs.chartRef.current;
        const canvas = await html2canvas(chartElement, {
          scale: 2,
          useCORS: true,
          logging: false
        });
        const chartImageData = canvas.toDataURL('image/png');
        
        // Calculate proper dimensions to maintain aspect ratio
        const imgWidth = Math.min(contentWidth, 160);
        const imgRatio = canvas.height / canvas.width;
        const imgHeight = imgWidth * imgRatio;
        
        // Add the chart image centered
        const chartX = margin + (contentWidth - imgWidth) / 2;
        doc.addImage(chartImageData, 'PNG', chartX, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 5;
      } catch (chartError) {
        console.error('Error capturing chart:', chartError);
        
        // Fallback if chart capture fails - show simple box with data
        doc.setFillColor(255, 250, 240); // Light yellow background
        doc.roundedRect(margin, yPosition, contentWidth, 30, 2, 2, 'F');
        
        // Find energy production value if available
        const energyProdValue = data.costBenefitAnalysis?.find(item => 
          item.label?.includes("Energy Production"))?.value || "N/A";
          
        doc.setFontSize(9);
        doc.text("Total energy production per year", margin + contentWidth/2, yPosition + 10, { align: 'center' });
        
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text(energyProdValue, margin + contentWidth/2, yPosition + 22, { align: 'center' });
        doc.setFont(undefined, 'normal');
        
        yPosition += 30 + 5;
      }
    }
    
    yPosition += 10;
    
    // 10) COST-BENEFIT ANALYSIS - IMPROVED STYLING
    // Check if we need a page break
    if (yPosition > pageHeight - 120) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Section title with accent bar
    doc.setFillColor(...colors.primary);
    doc.roundedRect(margin, yPosition, contentWidth, 10, 3, 3, 'F');
    doc.setFillColor(...colors.secondary);
    doc.roundedRect(margin, yPosition, 5, 10, 3, 0, 'F');
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text('COST-BENEFIT ANALYSIS', margin + 12, yPosition + 6.5);
    doc.setTextColor(0, 0, 0);
    yPosition += 14;
    
    // Financial metrics as cards in 2 columns
    const financialItems = data.costBenefitAnalysis?.filter(item => 
      !item.label?.includes("Energy Production")) || [];
      
    if (financialItems.length > 0) {
      // Get only financial metrics (exclude energy production)
      const halfWidth = contentWidth / 2 - 4;
      
      // Create side-by-side boxes with improved styling
      doc.setFillColor(242, 247, 243); // Light green
      doc.roundedRect(margin, yPosition, halfWidth, 45, 3, 3, 'F');
      doc.roundedRect(margin + halfWidth + 8, yPosition, halfWidth, 45, 3, 3, 'F');
      
      // Box 1 content - centered and improved
      if (financialItems[0]) {
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text(financialItems[0].label, margin + halfWidth/2, yPosition + 12, { align: 'center' });
        doc.setFont(undefined, 'normal');
        
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text(financialItems[0].value, margin + halfWidth/2, yPosition + 28, { align: 'center' });
        doc.setFont(undefined, 'normal');
      }
      
      // Box 2 content - centered and improved
      if (financialItems[1]) {
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text(financialItems[1].label, margin + halfWidth + 8 + halfWidth/2, yPosition + 12, { align: 'center' });
        doc.setFont(undefined, 'normal');
        
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text(financialItems[1].value, margin + halfWidth + 8 + halfWidth/2, yPosition + 28, { align: 'center' });
        doc.setFont(undefined, 'normal');
      }
      
      yPosition += 45 + sectionSpacing;
    } else {
      // Fallback if no financial data - show table with cost-benefit data
      const costBenefitData = [];
      if (data.costBenefitAnalysis) {
        data.costBenefitAnalysis.forEach(item => {
          costBenefitData.push([item.label, item.value]);
        });
      }
      
      doc.autoTable({
        head: [['Metric', 'Value']],
        body: costBenefitData,
        startY: yPosition,
        theme: 'grid',
        styles: { 
          fontSize: 9, 
          cellPadding: 5,
          lineColor: [220, 220, 220],
          lineWidth: 0.1
        },
        headStyles: { 
          fillColor: colors.primary, 
          textColor: 255,
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 120 },
          1: { cellWidth: 50, halign: 'right' }
        },
        margin: { left: margin, right: margin },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        }
      });
      
      yPosition = doc.autoTable.previous.finalY + sectionSpacing;
    }
    
    // 11) RECOMMENDATIONS SECTION - IMPROVED VISUAL DESIGN
    // Check if we need a page break
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Section title with accent bar
    doc.setFillColor(...colors.primary);
    doc.roundedRect(margin, yPosition, contentWidth, 10, 3, 3, 'F');
    doc.setFillColor(...colors.secondary);
    doc.roundedRect(margin, yPosition, 5, 10, 3, 0, 'F');
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text('KEY RECOMMENDATIONS', margin + 12, yPosition + 6.5);
    doc.setTextColor(0, 0, 0);
    yPosition += 14;
    
    // Recommendations box with improved styling
    doc.setFillColor(242, 247, 243); // Light green background
    doc.roundedRect(margin, yPosition, contentWidth, 50, 3, 3, 'F');
    
    // Add recommendations with enhanced styling
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    // Sample recommendations
    const recommendations = [
      "Invest in solar panel infrastructure to capitalize on the projected growth trend.",
      "Consider energy storage solutions to maximize return on investment.",
      "Evaluate technological upgrades to improve solar capture efficiency.",
      "Implement regular maintenance schedule to ensure optimal performance."
    ];
    
    let bulletY = yPosition + 10;
    recommendations.forEach((rec, index) => {
      // Styled bullet points with numbering
      doc.setFillColor(...colors.primary);
      doc.circle(margin + 8, bulletY, 2.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont(undefined, 'bold');
      doc.text((index + 1).toString(), margin + 8, bulletY + 2.5, { align: 'center' });
      
      // Reset text color and add recommendation text
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      
      // Recommendation text with auto-wrapping for long lines
      const splitText = doc.splitTextToSize(rec, contentWidth - 20);
      doc.text(splitText, margin + 16, bulletY + 3);
      bulletY += splitText.length > 1 ? 10 + (splitText.length - 1) * 5 : 12;
    });
    
    // 12) FOOTER - IMPROVED DESIGN
    // Add a divider line
    yPosition = pageHeight - 15;
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition - 5, pageWidth - margin, yPosition - 5);
    
    // Copyright notice
    doc.setFontSize(8);
    const copyrightText = `© ${new Date().getFullYear()} Ecopulse. All rights reserved.`;
    const copyrightWidth = doc.getStringUnitWidth(copyrightText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    const copyrightX = (pageWidth - copyrightWidth) / 2;
    doc.text(copyrightText, copyrightX, yPosition);
    
    // Add small logo at the footer
    doc.addImage(companyLogo, 'PNG', pageWidth - margin - 8, yPosition - 4, 8, 8);
    
    // Save the PDF
    doc.save('Energy_Recommendations.pdf');
    
    toast.success('PDF downloaded successfully!');
    return { success: true };
  } catch (error) {
    console.error('Download error:', error);
    toast.error('Failed to download PDF. Please try again.');
    return { success: false, error };
  }
};