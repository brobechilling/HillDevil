package com.example.backend.utils;

import java.io.ByteArrayOutputStream;
import java.util.List;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;

/**
 * Utility class để xuất QR code ra file PDF A4
 */
public class QrPdfExporter {

    /**
     * Tạo PDF A4 chứa nhiều QR code theo dạng lưới
     * 
     * @param title Tiêu đề trên đầu trang
     * @param items Danh sách QR items (label + PNG bytes)
     * @param cols Số cột mỗi hàng (mặc định 3)
     * @param qrSizePt Kích thước QR code (points, 1pt = 1/72 inch)
     * @return Byte array của file PDF
     */
    public static byte[] export(String title, List<QrItem> items, int cols, float qrSizePt) {
        try {
            // Khởi tạo document A4 với lề đẹp
            Document doc = new Document(PageSize.A4, 36, 36, 48, 36);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            PdfWriter.getInstance(doc, out);
            doc.open();

            // Thêm tiêu đề
            if (title != null && !title.isBlank()) {
                Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, Font.BOLD);
                Paragraph titlePara = new Paragraph(title, fontTitle);
                titlePara.setAlignment(Element.ALIGN_CENTER);
                titlePara.setSpacingAfter(20f);
                doc.add(titlePara);
            }

            // Tạo bảng với số cột chỉ định
            PdfPTable table = new PdfPTable(cols);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10f);

            // Thêm các QR code vào bảng
            for (QrItem item : items) {
                PdfPCell cell = new PdfPCell();
                cell.setBorder(Rectangle.BOX);
                cell.setPadding(10f);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);

                // Thêm QR image
                Image qrImg = Image.getInstance(item.pngBytes());
                qrImg.scaleToFit(qrSizePt, qrSizePt);
                qrImg.setAlignment(Image.ALIGN_CENTER);
                cell.addElement(qrImg);

                // Thêm label bên dưới QR
                if (item.label() != null && !item.label().isBlank()) {
                    Font labelFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Font.NORMAL);
                    Paragraph labelPara = new Paragraph(item.label(), labelFont);
                    labelPara.setAlignment(Element.ALIGN_CENTER);
                    labelPara.setSpacingBefore(5f);
                    cell.addElement(labelPara);
                }

                table.addCell(cell);
            }

            // Điền các ô trống để hoàn thiện hàng cuối
            int remaining = items.size() % cols;
            if (remaining != 0) {
                int emptyCells = cols - remaining;
                for (int i = 0; i < emptyCells; i++) {
                    PdfPCell emptyCell = new PdfPCell();
                    emptyCell.setBorder(Rectangle.NO_BORDER);
                    table.addCell(emptyCell);
                }
            }

            doc.add(table);
            doc.close();
            
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to export QR PDF", e);
        }
    }

    /**
     * Record để lưu thông tin một QR item
     * 
     * @param label Nhãn hiển thị bên dưới QR (vd: "Bàn A1")
     * @param pngBytes Byte array của ảnh QR code PNG
     */
    public record QrItem(String label, byte[] pngBytes) {}
}
