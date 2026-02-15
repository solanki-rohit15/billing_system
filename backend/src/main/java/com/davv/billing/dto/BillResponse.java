package com.davv.billing.dto;

import lombok.Data;

import java.util.List;

@Data
public class BillResponse {
    private String id;
    private String billId;
    private String facultyId;
    private String facultyName;
    private String program;
    private String department;
    private String pageNo;
    private String perWeek;
    private String semester;
    private String subject;
    private String subjectType;
    private String month;
    private Integer year;
    private Double totalHours;
    private Double ratePerHour;
    private Double totalAmount;
    private Double taxDeduction;
    private Double netAmount;
    private String status;
    private Boolean isUgcNetQualified;
    private List<BillRequest.DateDuration> datesWithDuration;
    private String createdAt;
}
