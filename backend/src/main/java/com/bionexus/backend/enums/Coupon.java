package com.bionexus.backend.enums;

// [TN-06] BẮT ĐẦU · Danh sách mã giảm giá cố định (chưa có bảng trong DB)
// import java.math.BigDecimal;
// import java.math.RoundingMode;

// /**
 // * Mã giảm giá. Hai kiểu: giảm theo phần trăm (có mức giảm tối đa) hoặc giảm một số tiền cố định.
 // * Muốn thêm mã mới thì thêm một dòng ở đây. Hướng mở rộng: chuyển sang bảng Coupons trong DB.
 // */
// public enum Coupon {
    // // mô tả, phần trăm giảm, tiền giảm cố định, giảm tối đa (0 = không giới hạn), tiền hàng tối thiểu
    // BIONEXUS10("Giảm 10% tiền hàng, tối đa 200.000đ", 10, 0, 200000, 0),
    // GIAM50K("Giảm 50.000đ cho đơn từ 500.000đ", 0, 50000, 0, 500000);

    // private final String description;
    // private final int percent;
    // private final BigDecimal fixedAmount;
    // private final BigDecimal maxDiscount;
    // private final BigDecimal minOrderAmount;

    // Coupon(String description, int percent, long fixedAmount, long maxDiscount, long minOrderAmount) {
        // this.description = description;
        // this.percent = percent;
        // this.fixedAmount = BigDecimal.valueOf(fixedAmount);
        // this.maxDiscount = BigDecimal.valueOf(maxDiscount);
        // this.minOrderAmount = BigDecimal.valueOf(minOrderAmount);
    // }

    // public String getDescription() {
        // return description;
    // }

    // public BigDecimal getMinOrderAmount() {
        // return minOrderAmount;
    // }

    // /** Tìm mã, không phân biệt hoa thường và bỏ khoảng trắng hai đầu. Không có thì trả null. */
    // public static Coupon find(String code) {
        // if (code == null) {
            // return null;
        // }
        // String normalized = code.trim().toUpperCase();
        // for (Coupon coupon : values()) {
            // if (coupon.name().equals(normalized)) {
                // return coupon;
            // }
        // }
        // return null;
    // }

    // /** Tiền hàng đã đủ mức tối thiểu để dùng mã chưa. */
    // public boolean isEligible(BigDecimal itemsTotal) {
        // return itemsTotal.compareTo(minOrderAmount) >= 0;
    // }

    // /** Số tiền được giảm cho một mức tiền hàng. Không bao giờ giảm quá tiền hàng. */
    // public BigDecimal discountFor(BigDecimal itemsTotal) {
        // BigDecimal discount;
        // if (percent > 0) {
            // // Làm tròn xuống đến đồng: tiền Việt không có số lẻ
            // discount = itemsTotal.multiply(BigDecimal.valueOf(percent)).divide(BigDecimal.valueOf(100), 0, RoundingMode.DOWN);
            // boolean hasMax = maxDiscount.compareTo(BigDecimal.ZERO) > 0;
            // if (hasMax && discount.compareTo(maxDiscount) > 0) {
                // discount = maxDiscount;
            // }
        // } else {
            // discount = fixedAmount;
        // }
        // if (discount.compareTo(itemsTotal) > 0) {
            // discount = itemsTotal;
        // }
        // return discount;
    // }
// }
// [TN-06] KẾT THÚC
