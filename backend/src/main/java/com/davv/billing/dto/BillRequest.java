package com.davv.billing.dto;

import lombok.Data;

import java.util.List;

// Bill DTOs
@Data
public class BillRequest {
    private String program;
    private String department;
    private String pageNo;
    private String perWeek;
    private String semester;
    private String subject;
    private String subjectType;
    private String month;
    private Integer year;
    private List<DateDuration> datesWithDuration;

    @Data
    public static class DateDuration {
        private String date;
        private Double hours;
    }
}
