package com.davv.billing.repository;

import com.davv.billing.model.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<OtpVerification, String> {
    Optional<OtpVerification> findByEmailAndOtpAndExpiresAtAfter(String email, String otp, LocalDateTime now);
    Optional<OtpVerification> findTopByEmailOrderByCreatedAtDesc(String email);
    void deleteByExpiresAtBefore(LocalDateTime now);
    void deleteByEmail(String email);
}
