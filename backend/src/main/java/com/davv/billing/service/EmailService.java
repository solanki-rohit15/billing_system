package com.davv.billing.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username:noreply@davv.ac.in}")
    private String fromEmail;
    
    /**
     * Send OTP to faculty email
     */
    public void sendOtpEmail(String toEmail, String facultyName, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Faculty Billing Portal - OTP Verification");
            message.setText(String.format(
                "Dear %s,\n\n" +
                "Your OTP for Faculty Billing Portal login is: %s\n\n" +
                "This OTP is valid for 5 minutes.\n\n" +
                "If you did not request this OTP, please ignore this email.\n\n" +
                "Thank you,\n" +
                "DAVV Faculty Billing Team",
                facultyName, otp
            ));
            
            mailSender.send(message);
            log.info("OTP email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to: {}. Error: {}", toEmail, e.getMessage());
            // In development, print OTP to console if email fails
            System.out.println("==============================================");
            System.out.println("EMAIL SEND FAILED - OTP for " + toEmail + ": " + otp);
            System.out.println("==============================================");
        }
    }
    
    /**
     * Send welcome email to faculty
     */
    public void sendWelcomeEmail(String toEmail, String facultyName, String uid) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Welcome to DAVV Faculty Billing Portal");
            message.setText(String.format(
                "Dear %s,\n\n" +
                "Welcome to the DAVV Faculty Billing Portal!\n\n" +
                "Your account has been created successfully.\n" +
                "Your University ID (UID): %s\n\n" +
                "You can now log in using your UID and email OTP verification.\n\n" +
                "Thank you,\n" +
                "DAVV Faculty Billing Team",
                facultyName, uid
            ));
            
            mailSender.send(message);
            log.info("Welcome email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send welcome email to: {}. Error: {}", toEmail, e.getMessage());
        }
    }
}
