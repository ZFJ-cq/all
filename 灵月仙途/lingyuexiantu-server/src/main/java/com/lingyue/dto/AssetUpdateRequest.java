package com.lingyue.dto;

import java.math.BigDecimal;

public class AssetUpdateRequest {
    private Long assetTypeId;
    private BigDecimal quantity;

    public Long getAssetTypeId() {
        return assetTypeId;
    }

    public void setAssetTypeId(Long assetTypeId) {
        this.assetTypeId = assetTypeId;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }
}