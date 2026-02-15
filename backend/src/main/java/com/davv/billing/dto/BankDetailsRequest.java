package com.davv.billing.dto;

import lombok.Data;

@Data
public class BankDetailsRequest {
    private String designation;
    private String qualification;
    private String address;
    private String bankName;
    private String bankAccountNumber;
    private String ifscCode;
    private String panNumber;
    private String aadharNumber;
}
