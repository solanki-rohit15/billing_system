package com.davv.billing.repository;

import com.davv.billing.model.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty, String> {
    Optional<Faculty> findByUid(String uid);
    Optional<Faculty> findByUidIgnoreCase(String uid);
    Optional<Faculty> findByEmail(String email);
    boolean existsByUid(String uid);
    boolean existsByEmail(String email);
}
