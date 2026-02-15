package com.davv.billing.service;

import com.davv.billing.dto.*;
import com.davv.billing.model.Faculty;
import com.davv.billing.model.OtpVerification;
import com.davv.billing.repository.FacultyRepository;
import com.davv.billing.repository.OtpRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final FacultyRepository facultyRepository;
    private final OtpRepository otpRepository;
    private final EmailService emailService;
    private final SecureRandom random = new SecureRandom();
    
    /**
     * Send OTP to faculty email
     */
    @Transactional
    public AuthResponse sendOtp(OtpRequest request) {
        // Verify faculty exists by UID
        Faculty faculty = facultyRepository.findByUidIgnoreCase(request.getUid())
                .orElseThrow(() -> new RuntimeException("Faculty not found with UID: " + request.getUid()));
        
        // Delete any existing OTPs for this email
        otpRepository.deleteByEmail(faculty.getEmail());
        
        // Generate 6-digit OTP
        String otp = String.format("%06d", random.nextInt(1000000));
        
        // Save OTP with 5-minute expiry
        OtpVerification otpVerification = new OtpVerification();
        otpVerification.setEmail(faculty.getEmail());
        otpVerification.setOtp(otp);
        otpVerification.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        otpRepository.save(otpVerification);
        
        // Send OTP email
        emailService.sendOtpEmail(faculty.getEmail(), faculty.getName(), otp);
        
        log.info("OTP sent to email: {} for UID: {}", faculty.getEmail(), request.getUid());
        
        // Return faculty details (without sensitive info)
        AuthResponse response = new AuthResponse();
        response.setSuccess(true);
        response.setMessage("OTP sent to your registered email: " + maskEmail(faculty.getEmail()));
        
        // Include basic faculty info for UI
        FacultyResponse facultyResponse = new FacultyResponse();
        facultyResponse.setId(faculty.getId());
        facultyResponse.setUid(faculty.getUid());
        facultyResponse.setName(faculty.getName());
        facultyResponse.setEmail(maskEmail(faculty.getEmail()));
        facultyResponse.setIsVerified(faculty.getIsVerified());
        facultyResponse.setBankDetailsCompleted(faculty.getBankDetailsCompleted());
        
        response.setFaculty(facultyResponse);
        return response;
    }
    
    /**
     * Verify OTP and complete login
     */
    @Transactional
    public AuthResponse verifyOtp(OtpVerifyRequest request) {
        // Find faculty by UID
        Faculty faculty = facultyRepository.findByUidIgnoreCase(request.getUid())
                .orElseThrow(() -> new RuntimeException("Faculty not found"));
        
        // Find valid OTP for this email
        OtpVerification otpVerification = otpRepository.findByEmailAndOtpAndExpiresAtAfter(
                faculty.getEmail(), 
                request.getOtp(), 
                LocalDateTime.now()
        ).orElseThrow(() -> new RuntimeException("Invalid or expired OTP"));
        
        // Check if already verified
        if (otpVerification.getVerified()) {
            throw new RuntimeException("OTP already used");
        }
        
        // Mark OTP as verified
        otpVerification.setVerified(true);
        otpRepository.save(otpVerification);
        
        // Update faculty verification status
        faculty.setIsVerified(true);
        facultyRepository.save(faculty);
        
        log.info("OTP verified successfully for UID: {}", request.getUid());
        
        // Return complete faculty details
        AuthResponse response = new AuthResponse();
        response.setSuccess(true);
        response.setMessage("Login successful");
        
        FacultyResponse facultyResponse = new FacultyResponse();
        facultyResponse.setId(faculty.getId());
        facultyResponse.setUid(faculty.getUid());
        facultyResponse.setName(faculty.getName());
        facultyResponse.setEmail(faculty.getEmail());
        facultyResponse.setPhone(faculty.getPhone());
        facultyResponse.setIsUgcNetQualified(faculty.getIsUgcNetQualified());
        facultyResponse.setIsVerified(faculty.getIsVerified());
        facultyResponse.setBankDetailsCompleted(faculty.getBankDetailsCompleted());
        
        response.setFaculty(facultyResponse);
        return response;
    }
    
    /**
     * Mask email for security (show only first char and domain)
     */
    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return email;
        }
        String[] parts = email.split("@");
        String localPart = parts[0];
        if (localPart.length() <= 2) {
            return email;
        }
        return localPart.charAt(0) + "***@" + parts[1];
    }
    
    /**
     * Cleanup expired OTPs (can be scheduled)
     */
    @Transactional
    public void cleanupExpiredOtps() {
        otpRepository.deleteByExpiresAtBefore(LocalDateTime.now());
        log.info("Cleaned up expired OTPs");
    }
}
