import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const exportPeerToPeerPDF = async (data) => {
  try {
    // Create new PDF document
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add title and metadata
    doc.setFontSize(18);
    doc.text('Peer-to-Peer Energy Generation Data', 14, 22);
    
    // Add subtitle with date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleDateString()} - EcoPulse Energy Dashboard`, 14, 30);
    
    // Create headers for the table
    const headers = [
      'Year', 
      'Cebu (GWh)', 
      'Negros (GWh)', 
      'Panay (GWh)', 
      'Leyte-Samar (GWh)', 
      'Bohol (GWh)', 
      'Visayas Total (GWh)', 
      'Visayas Consumption (GWh)'
    ];
    
    // Extract the relevant data from each record
    const tableData = data.map(record => [
      record.year,
      record.cebuTotal.toFixed(2),
      record.negrosTotal.toFixed(2),
      record.panayTotal.toFixed(2),
      record.leyteSamarTotal.toFixed(2),
      record.boholTotal.toFixed(2),
      record.visayasTotal.toFixed(2),
      record.visayasConsumption.toFixed(2)
    ]);
    
    // Generate the table
    doc.autoTable({
      head: [headers],
      body: tableData,
      startY: 40,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });
    
    // Add information about renewable energy
    const finalY = doc.lastAutoTable.finalY || 150;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Energy Distribution by Region', 14, finalY + 10);
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    
    // Create a second table with renewable energy details
    const renewableHeaders = [
      'Region', 
      'Total Energy (GWh)', 
      'Non-Renewable (GWh)', 
      'Renewable (GWh)', 
      'Renewable %'
    ];
    
    // Calculate renewable percentages
    const renewableData = data.flatMap(record => {
      // Only use the most recent year for the second table
      if (record.year === Math.max(...data.map(r => r.year))) {
        const calculateRenewablePercent = (total, nonRenewable) => {
          const renewable = total - nonRenewable;
          return ((renewable / total) * 100).toFixed(1) + '%';
        };
        
        // Get the record's all records array for detailed data
        const yearRecords = record.allRecords || [];
        const firstRecord = yearRecords[0] || {};
        
        // Helper function to safely get values
        const getValue = (key) => {
          const rec = yearRecords.find(r => r[key] !== undefined);
          return rec ? rec[key] : 0;
        };
        
        return [
          ['Cebu', 
           record.cebuTotal.toFixed(2), 
           getValue('Cebu Total Non-Renewable Energy (GWh)') || '0.00',
           (record.cebuTotal - (getValue('Cebu Total Non-Renewable Energy (GWh)') || 0)).toFixed(2),
           calculateRenewablePercent(record.cebuTotal, getValue('Cebu Total Non-Renewable Energy (GWh)') || 0)
          ],
          ['Negros', 
           record.negrosTotal.toFixed(2), 
           getValue('Negros Total Non-Renewable Energy (GWh)') || '0.00',
           (record.negrosTotal - (getValue('Negros Total Non-Renewable Energy (GWh)') || 0)).toFixed(2),
           calculateRenewablePercent(record.negrosTotal, getValue('Negros Total Non-Renewable Energy (GWh)') || 0)
          ],
          ['Panay', 
           record.panayTotal.toFixed(2), 
           getValue('Panay Total Non-Renewable Energy (GWh)') || '0.00',
           (record.panayTotal - (getValue('Panay Total Non-Renewable Energy (GWh)') || 0)).toFixed(2),
           calculateRenewablePercent(record.panayTotal, getValue('Panay Total Non-Renewable Energy (GWh)') || 0)
          ],
          ['Leyte-Samar', 
           record.leyteSamarTotal.toFixed(2), 
           getValue('Leyte-Samar Total Non-Renewable (GWh)') || '0.00',
           (record.leyteSamarTotal - (getValue('Leyte-Samar Total Non-Renewable (GWh)') || 0)).toFixed(2),
           calculateRenewablePercent(record.leyteSamarTotal, getValue('Leyte-Samar Total Non-Renewable (GWh)') || 0)
          ],
          ['Bohol', 
           record.boholTotal.toFixed(2), 
           getValue('Bohol Total Non-Renewable (GWh)') || '0.00',
           (record.boholTotal - (getValue('Bohol Total Non-Renewable (GWh)') || 0)).toFixed(2),
           calculateRenewablePercent(record.boholTotal, getValue('Bohol Total Non-Renewable (GWh)') || 0)
          ],
          ['Visayas Total', 
           record.visayasTotal.toFixed(2), 
           (parseFloat(getValue('Cebu Total Non-Renewable Energy (GWh)') || 0) +
            parseFloat(getValue('Negros Total Non-Renewable Energy (GWh)') || 0) +
            parseFloat(getValue('Panay Total Non-Renewable Energy (GWh)') || 0) +
            parseFloat(getValue('Leyte-Samar Total Non-Renewable (GWh)') || 0) +
            parseFloat(getValue('Bohol Total Non-Renewable (GWh)') || 0)).toFixed(2),
           (record.visayasTotal - 
            (parseFloat(getValue('Cebu Total Non-Renewable Energy (GWh)') || 0) +
             parseFloat(getValue('Negros Total Non-Renewable Energy (GWh)') || 0) +
             parseFloat(getValue('Panay Total Non-Renewable Energy (GWh)') || 0) +
             parseFloat(getValue('Leyte-Samar Total Non-Renewable (GWh)') || 0) +
             parseFloat(getValue('Bohol Total Non-Renewable (GWh)') || 0))).toFixed(2),
           calculateRenewablePercent(
             record.visayasTotal,
             parseFloat(getValue('Cebu Total Non-Renewable Energy (GWh)') || 0) +
             parseFloat(getValue('Negros Total Non-Renewable Energy (GWh)') || 0) +
             parseFloat(getValue('Panay Total Non-Renewable Energy (GWh)') || 0) +
             parseFloat(getValue('Leyte-Samar Total Non-Renewable (GWh)') || 0) +
             parseFloat(getValue('Bohol Total Non-Renewable (GWh)') || 0)
           )
          ]
        ];
      }
      return [];
    });
    
    // Add the renewable energy table
    doc.autoTable({
      head: [renewableHeaders],
      body: renewableData,
      startY: finalY + 15,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [46, 204, 113],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });
    
    // Add footer with page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      
      // Footer text
      doc.text(
        'EcoPulse Energy Dashboard - Confidential', 
        14, 
        doc.internal.pageSize.height - 10
      );
      
      // Page numbers
      doc.text(
        `Page ${i} of ${pageCount}`, 
        doc.internal.pageSize.width - 30, 
        doc.internal.pageSize.height - 10
      );
    }
    
    // Save the PDF with a filename based on the current date
    const today = new Date();
    const filename = `peer-to-peer-energy-data-${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}.pdf`;
    
    doc.save(filename);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};