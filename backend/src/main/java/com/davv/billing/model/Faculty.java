package com.davv.billing.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "faculty")
@Data
public class Faculty {
    
    @Id
    private String id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(unique = true, nullable = false)
    private String uid;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String phone;
    
    @Column(name = "is_ugc_net_qualified")
    private Boolean isUgcNetQualified = false;
    
    @Column(name = "is_verified")
    private Boolean isVerified = false;
    
    @Column(name = "bank_details_completed")
    private Boolean bankDetailsCompleted = false;
    
    private String designation;
    private String qualification;
    
    @Column(columnDefinition = "TEXT")
    private String address;
    
    @Column(name = "bank_name")
    private String bankName;
    
    @Column(name = "bank_account_number")
    private String bankAccountNumber;
    
    @Column(name = "ifsc_code")
    private String ifscCode;
    
    @Column(name = "pan_number")
    private String panNumber;
    
    @Column(name = "aadhar_number")
    private String aadharNumber;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
