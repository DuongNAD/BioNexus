package com.bionexus.backend.dto;

import java.util.List;

/** Danh sách phân trang: { items, page, size, total }. page bắt đầu từ 1. */
public record PageDto<T>(List<T> items, int page, int size, int total) {
}
