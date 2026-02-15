package com.davv.billing.service;

import com.davv.billing.dto.*;
import com.davv.billing.model.Bill;
import com.davv.billing.model.Faculty;
import com.davv.billing.repository.BillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BillService {
    
    private final BillRepository billRepository;
    private final FacultyService facultyService;
    
    // Rate configuration based on UGC NET status
    private static final double UGC_THEORY_RATE = 800.0;
    private static final double UGC_PRACTICAL_RATE = 800.0;
    private static final double UGC_LAB_RATE = 400.0;
    
    private static final double NON_UGC_THEORY_RATE = 600.0;
    private static final double NON_UGC_PRACTICAL_RATE = 600.0;
    private static final double NON_UGC_LAB_RATE = 200.0;
    
    private static final double TAX_RATE = 0.10; // 10%
    
    @Transactional
    public BillResponse createBill(String facultyId, BillRequest request) {
        Faculty faculty = facultyService.getFacultyEntityById(facultyId);
        
        // Calculate total hours
        double totalHours = request.getDatesWithDuration().stream()
                .mapToDouble(BillRequest.DateDuration::getHours)
                .sum();
        
        // Calculate rate based on UGC status and subject type
        double ratePerHour = calculateRate(faculty.getIsUgcNetQualified(), request.getSubjectType());
        
        // Calculate amounts
        double totalAmount = totalHours * ratePerHour;
        double taxDeduction = totalAmount * TAX_RATE;
        double netAmount = totalAmount - taxDeduction;
        
        // Create bill
        Bill bill = new Bill();
        bill.setBillId("BILL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        bill.setFaculty(faculty);
        bill.setProgram(request.getProgram());
        bill.setDepartment(request.getDepartment());
        bill.setPageNo(request.getPageNo());
        bill.setPerWeek(request.getPerWeek());
        bill.setSemester(request.getSemester());
        bill.setSubject(request.getSubject());
        bill.setSubjectType(request.getSubjectType());
        bill.setMonth(request.getMonth());
        bill.setYear(request.getYear());
        bill.setTotalHours(totalHours);
        bill.setRatePerHour(ratePerHour);
        bill.setTotalAmount(totalAmount);
        bill.setTaxDeduction(taxDeduction);
        bill.setNetAmount(netAmount);
        bill.setStatus("pending");
        bill.setIsUgcNetQualified(faculty.getIsUgcNetQualified());
        
        // Convert dates
        List<Bill.DateWithDuration> dates = request.getDatesWithDuration().stream()
                .map(d -> {
                    Bill.DateWithDuration dwd = new Bill.DateWithDuration();
                    dwd.setDate(d.getDate());
                    dwd.setHours(d.getHours());
                    return dwd;
                })
                .collect(Collectors.toList());
        bill.setDatesWithDuration(dates);
        
        Bill saved = billRepository.save(bill);
        return toResponse(saved);
    }
    
    public List<BillResponse> getFacultyBills(Long facultyId) {
        return billRepository.findByFacultyId(facultyId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
    
    public List<BillResponse> getAllBills() {
        return billRepository.findAllWithFaculty().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
    
    public List<BillResponse> getBillsByMonthYear(String month, Integer year) {
        return billRepository.findByMonthAndYear(month, year).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public BillResponse updateBillStatus(Long billId, String status) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new RuntimeException("Bill not found"));
        
        bill.setStatus(status);
        bill.setUpdatedAt(LocalDateTime.now());
        
        Bill updated = billRepository.save(bill);
        return toResponse(updated);
    }
    
    public StatsResponse getStats() {
        List<Bill> bills = billRepository.findAll();
        long totalFaculty = facultyService.getAllFaculty().size();
        
        StatsResponse stats = new StatsResponse();
        stats.setTotalFaculty(totalFaculty);
        stats.setTotalBills(bills.size());
        stats.setPendingBills(bills.stream().filter(b -> "pending".equals(b.getStatus())).count());
        stats.setApprovedBills(bills.stream().filter(b -> "approved".equals(b.getStatus())).count());
        stats.setPaidBills(bills.stream().filter(b -> "paid".equals(b.getStatus())).count());
        stats.setTotalAmount(bills.stream().mapToDouble(Bill::getTotalAmount).sum());
        
        return stats;
    }
    
    private double calculateRate(Boolean isUgcNetQualified, String subjectType) {
        boolean isUgc = isUgcNetQualified != null && isUgcNetQualified;
        
        switch (subjectType.toLowerCase()) {
            case "theory":
                return isUgc ? UGC_THEORY_RATE : NON_UGC_THEORY_RATE;
            case "practical":
                return isUgc ? UGC_PRACTICAL_RATE : NON_UGC_PRACTICAL_RATE;
            case "lab":
                return isUgc ? UGC_LAB_RATE : NON_UGC_LAB_RATE;
            default:
                throw new RuntimeException("Invalid subject type: " + subjectType);
        }
    }
    
    private BillResponse toResponse(Bill bill) {
        BillResponse response = new BillResponse();
        response.setId(bill.getId());
        response.setBillId(bill.getBillId());
        response.setFacultyId(Long.valueOf(bill.getFaculty().getUid()));
        response.setFacultyName(bill.getFaculty().getName());
        response.setProgram(bill.getProgram());
        response.setDepartment(bill.getDepartment());
        response.setPageNo(bill.getPageNo());
        response.setPerWeek(bill.getPerWeek());
        response.setSemester(bill.getSemester());
        response.setSubject(bill.getSubject());
        response.setSubjectType(bill.getSubjectType());
        response.setMonth(bill.getMonth());
        response.setYear(bill.getYear());
        response.setTotalHours(bill.getTotalHours());
        response.setRatePerHour(bill.getRatePerHour());
        response.setTotalAmount(bill.getTotalAmount());
        response.setTaxDeduction(bill.getTaxDeduction());
        response.setNetAmount(bill.getNetAmount());
        response.setStatus(bill.getStatus());
        response.setIsUgcNetQualified(bill.getIsUgcNetQualified());
        
        if (bill.getDatesWithDuration() != null) {
            List<BillRequest.DateDuration> dates = bill.getDatesWithDuration().stream()
                    .map(d -> {
                        BillRequest.DateDuration dd = new BillRequest.DateDuration();
                        dd.setDate(d.getDate());
                        dd.setHours(d.getHours());
                        return dd;
                    })
                    .collect(Collectors.toList());
            response.setDatesWithDuration(dates);
        }
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        response.setCreatedAt(bill.getCreatedAt().format(formatter));
        
        return response;
    }
}
