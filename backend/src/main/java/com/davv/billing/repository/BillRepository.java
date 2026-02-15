package com.davv.billing.repository;

import com.davv.billing.model.Bill;
import com.davv.billing.model.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BillRepository extends JpaRepository<Bill, String> {
    List<Bill> findByFaculty(Faculty faculty);
    List<Bill> findByFacultyId(String facultyId);
    List<Bill> findByMonthAndYear(String month, Integer year);
    List<Bill> findByStatus(String status);
    
    @Query("SELECT b FROM Bill b JOIN FETCH b.faculty ORDER BY b.createdAt DESC")
    List<Bill> findAllWithFaculty();
}
