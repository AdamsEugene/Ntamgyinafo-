import { Share, Alert } from "react-native";

/**
 * Export data to CSV format
 */
export const exportToCSV = async (
  data: any[],
  headers: string[],
  filename: string
) => {
  try {
    // Create CSV content
    const csvHeaders = headers.join(",");
    const csvRows = data.map((row) => {
      return headers.map((header) => {
        const value = row[header] || "";
        // Escape commas and quotes
        if (
          typeof value === "string" &&
          (value.includes(",") || value.includes('"'))
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
    });

    const csvContent = [
      csvHeaders,
      ...csvRows.map((row) => row.join(",")),
    ].join("\n");

    // Share the CSV content
    const result = await Share.share({
      message: csvContent,
      title: `Export ${filename}.csv`,
    });

    if (result.action === Share.sharedAction) {
      Alert.alert(
        "Success",
        `CSV file exported successfully. You can save it from the share menu.`
      );
    }
  } catch (error) {
    console.error("Export CSV error:", error);
    Alert.alert("Error", "Failed to export CSV file");
  }
};

/**
 * Generate PDF content (HTML-based, simplified)
 * Note: For production, consider using react-native-pdf or react-native-html-to-pdf
 */
export const generatePDFContent = (
  title: string,
  data: any[],
  headers: string[]
): string => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
        }
        h1 {
          color: #1B5E20;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          background-color: #1B5E20;
          color: white;
          padding: 12px;
          text-align: left;
          border: 1px solid #ddd;
        }
        td {
          padding: 10px;
          border: 1px solid #ddd;
        }
        tr:nth-child(even) {
          background-color: #f2f2f2;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p>Generated on: ${new Date().toLocaleString()}</p>
      <table>
        <thead>
          <tr>
            ${headers.map((h) => `<th>${h}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${data
            .map(
              (row) =>
                `<tr>${headers
                  .map((header) => `<td>${row[header] || ""}</td>`)
                  .join("")}</tr>`
            )
            .join("")}
        </tbody>
      </table>
      <div class="footer">
        <p>Ntamgyinafoɔ - Property Marketplace</p>
      </div>
    </body>
    </html>
  `;

  return html;
};

/**
 * Export data to PDF (as HTML that can be converted to PDF)
 */
export const exportToPDF = async (
  title: string,
  data: any[],
  headers: string[],
  filename: string
) => {
  try {
    const htmlContent = generatePDFContent(title, data, headers);

    // Share the HTML content
    // Note: User can open in browser and print to PDF
    const result = await Share.share({
      message: htmlContent,
      title: `Export ${filename}.html`,
    });

    if (result.action === Share.sharedAction) {
      Alert.alert(
        "Success",
        "HTML file exported. Open it in a browser and use Print > Save as PDF to create a PDF file."
      );
    }
  } catch (error) {
    console.error("Export PDF error:", error);
    Alert.alert("Error", "Failed to export PDF file");
  }
};

/**
 * Format date for export
 */
export const formatDateForExport = (date: Date): string => {
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

/**
 * Format currency for export
 */
export const formatCurrencyForExport = (amount: string | number): string => {
  if (typeof amount === "string") {
    return amount.replace("₵", "").trim();
  }
  return amount.toString();
};
