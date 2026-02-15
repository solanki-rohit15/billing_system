package com.davv.billing.dto;

import lombok.Data;

@Data
public class OtpRequest {
    private String uid;
    private String name;
    private String phone;
}
