package com.davv.billing.dto;

import lombok.Data;

@Data
public class StatsResponse {
    private long totalFaculty;
    private long totalBills;
    private long pendingBills;
    private long approvedBills;
    private long paidBills;
    private double totalAmount;
}
