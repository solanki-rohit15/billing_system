package com.davv.billing.service;

import com.davv.billing.dto.*;
import com.davv.billing.model.Faculty;
import com.davv.billing.repository.FacultyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FacultyService {

    @Autowired
    private final FacultyRepository facultyRepository;
    
    public List<FacultyResponse> getAllFaculty() {
        return facultyRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
    
    public FacultyResponse getFacultyByUid(String uid) {
        Faculty faculty = facultyRepository.findByUidIgnoreCase(uid)
                .orElseThrow(() -> new RuntimeException("Faculty not found with UID: " + uid));
        return toResponse(faculty);
    }
    
    public Faculty getFacultyEntityById(String id) {
        return facultyRepository.findByUid(id)
                .orElseThrow(() -> new RuntimeException("Faculty not found with ID: " + id));
    }
    
    @Transactional
    public FacultyResponse createFaculty(FacultyRequest request) {
        if (facultyRepository.existsByUid(request.getUid().toUpperCase())) {
            throw new RuntimeException("Faculty with UID " + request.getUid() + " already exists");
        }
        
        Faculty faculty = new Faculty();
        faculty.setUid(request.getUid().toUpperCase());
        faculty.setName(request.getName());
        faculty.setPhone(request.getPhone());
        faculty.setIsUgcNetQualified(request.getIsUgcNetQualified() != null ? request.getIsUgcNetQualified() : false);
        faculty.setIsVerified(false);
        faculty.setBankDetailsCompleted(false);
        
        Faculty saved = facultyRepository.save(faculty);
        return toResponse(saved);
    }
    
    @Transactional
    public FacultyResponse updateBankDetails(String facultyId, BankDetailsRequest request) {
        Faculty faculty = getFacultyEntityById(facultyId);
        
        faculty.setDesignation(request.getDesignation());
        faculty.setQualification(request.getQualification());
        faculty.setAddress(request.getAddress());
        faculty.setBankName(request.getBankName());
        faculty.setBankAccountNumber(request.getBankAccountNumber());
        faculty.setIfscCode(request.getIfscCode().toUpperCase());
        faculty.setPanNumber(request.getPanNumber().toUpperCase());
        faculty.setAadharNumber(request.getAadharNumber());
        faculty.setBankDetailsCompleted(true);
        faculty.setUpdatedAt(LocalDateTime.now());
        
        Faculty updated = facultyRepository.save(faculty);
        return toResponse(updated);
    }
    
    @Transactional
    public FacultyResponse updateUgcStatus(String facultyId, Boolean isUgcNetQualified) {
        Faculty faculty = getFacultyEntityById(facultyId);
        faculty.setIsUgcNetQualified(isUgcNetQualified);
        faculty.setUpdatedAt(LocalDateTime.now());
        
        Faculty updated = facultyRepository.save(faculty);
        return toResponse(updated);
    }
    
    @Transactional
    public void deleteFaculty(Long facultyId) {
        facultyRepository.deleteById(facultyId);
    }
    
    private FacultyResponse toResponse(Faculty faculty) {
        FacultyResponse response = new FacultyResponse();
//        response.setId(faculty.getId());
        response.setUid(faculty.getUid());
        response.setName(faculty.getName());
        response.setPhone(faculty.getPhone());
        response.setIsUgcNetQualified(faculty.getIsUgcNetQualified());
        response.setIsVerified(faculty.getIsVerified());
        response.setBankDetailsCompleted(faculty.getBankDetailsCompleted());
        response.setDesignation(faculty.getDesignation());
        response.setQualification(faculty.getQualification());
        response.setAddress(faculty.getAddress());
        response.setBankName(faculty.getBankName());
        response.setBankAccountNumber(faculty.getBankAccountNumber());
        response.setIfscCode(faculty.getIfscCode());
        response.setPanNumber(faculty.getPanNumber());
        response.setAadharNumber(faculty.getAadharNumber());
        return response;
    }
}
