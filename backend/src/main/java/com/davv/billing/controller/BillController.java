package com.davv.billing.controller;

import com.davv.billing.dto.*;
import com.davv.billing.service.BillService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BillController {
    
    private final BillService billService;
    
    @PostMapping("/{facultyId}")
    public ResponseEntity<BillResponse> createBill(
            @PathVariable String facultyId,
            @RequestBody BillRequest request) {
        try {
            return ResponseEntity.ok(billService.createBill(facultyId, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/faculty/{facultyId}")
    public ResponseEntity<List<BillResponse>> getFacultyBills(@PathVariable Long facultyId) {
        return ResponseEntity.ok(billService.getFacultyBills(facultyId));
    }
    
    @GetMapping("/admin")
    public ResponseEntity<List<BillResponse>> getAllBills() {
        return ResponseEntity.ok(billService.getAllBills());
    }
    
    @GetMapping("/month/{month}/year/{year}")
    public ResponseEntity<List<BillResponse>> getBillsByMonthYear(
            @PathVariable String month, 
            @PathVariable Integer year) {
        return ResponseEntity.ok(billService.getBillsByMonthYear(month, year));
    }
    
    @PutMapping("/{billId}/status")
    public ResponseEntity<BillResponse> updateBillStatus(
            @PathVariable Long billId, 
            @RequestParam String status) {
        try {
            return ResponseEntity.ok(billService.updateBillStatus(billId, status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/stats")
    public ResponseEntity<StatsResponse> getStats() {
        return ResponseEntity.ok(billService.getStats());
    }
}
