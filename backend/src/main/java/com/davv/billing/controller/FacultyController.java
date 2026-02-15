package com.davv.billing.controller;

import com.davv.billing.dto.*;
import com.davv.billing.service.FacultyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/faculty")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FacultyController {
    
    private final FacultyService facultyService;
    
    @GetMapping
    public ResponseEntity<List<FacultyResponse>> getAllFaculty() {
        System.out.println("chalgya ");
        return ResponseEntity.ok(facultyService.getAllFaculty());
    }
    
    @GetMapping("/uid/{uid}")
    public ResponseEntity<FacultyResponse> getFacultyByUid(@PathVariable String uid) {
        try {
            return ResponseEntity.ok(facultyService.getFacultyByUid(uid));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<FacultyResponse> createFaculty(@RequestBody FacultyRequest request) {
        try {
            return ResponseEntity.ok(facultyService.createFaculty(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}/bank-details")
    public ResponseEntity<FacultyResponse> updateBankDetails(
            @PathVariable Long id,
            @RequestBody BankDetailsRequest request) {
        try {
            return ResponseEntity.ok(facultyService.updateBankDetails(String.valueOf(id), request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}/ugc-status")
    public ResponseEntity<FacultyResponse> updateUgcStatus(
            @PathVariable String id,
            @RequestParam Boolean isUgcNetQualified) {
        try {
            return ResponseEntity.ok(facultyService.updateUgcStatus(id, isUgcNetQualified));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFaculty(@PathVariable Long id) {
        try {
            facultyService.deleteFaculty(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
