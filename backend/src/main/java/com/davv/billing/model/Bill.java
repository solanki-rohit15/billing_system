package com.davv.billing.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "bills")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Bill {
    
    @Id
    private String id;
    
    @Column(name = "bill_id", unique = true)
    private String billId;

    @Column
    private String facultyUid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "faculty_id", nullable = false)
    private Faculty faculty;
    
    @Column(nullable = false)
    private String program;
    
    private String department;
    
    @Column(name = "page_no")
    private String pageNo;
    
    @Column(name = "per_week")
    private String perWeek;
    
    private String semester;
    
    @Column(nullable = false)
    private String subject;
    
    @Column(name = "subject_type", nullable = false)
    private String subjectType; // theory, practical, lab
    
    @Column(nullable = false)
    private String month;
    
    @Column(nullable = false)
    private Integer year;
    
    @Column(name = "total_hours", nullable = false)
    private Double totalHours;
    
    @Column(name = "rate_per_hour", nullable = false)
    private Double ratePerHour;
    
    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;
    
    @Column(name = "tax_deduction")
    private Double taxDeduction;
    
    @Column(name = "net_amount")
    private Double netAmount;
    
    @Column(length = 20)
    private String status = "pending"; // pending, approved, paid
    
    @Column(name = "is_ugc_net_qualified")
    private Boolean isUgcNetQualified;
    
    @ElementCollection
    @CollectionTable(name = "bill_dates", joinColumns = @JoinColumn(name = "bill_id"))
    private List<DateWithDuration> datesWithDuration;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        if (billId == null) {
            billId = "BILL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        // Auto-calculate tax and net amount
        if (totalAmount != null && taxDeduction == null) {
            taxDeduction = totalAmount * 0.10;
            netAmount = totalAmount - taxDeduction;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    @Embeddable
    @Data
    public static class DateWithDuration {
        private String date;
        private Double hours;
    }
}
