package com.exam.service;

import com.exam.model.User;
import com.exam.model.CollegeLookup;
import com.exam.model.Role;
import com.exam.repository.CollegeLookupRepository;
import com.exam.repository.UserRepository;

import org.apache.poi.ss.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ExcelService {

    @Autowired
    private CollegeLookupRepository collegeRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
	private BCryptPasswordEncoder passwordEncoder;

    public List<User> parseExcelFile(MultipartFile file) throws Exception {
        List<User> users = new ArrayList<>();
        InputStream inputStream = file.getInputStream();
        Workbook workbook = WorkbookFactory.create(inputStream);
        Sheet sheet = workbook.getSheetAt(0); // Read first sheet

        for (Row row : sheet) {
            if (row.getRowNum() == 0) continue; // Skip header row

            String email = row.getCell(1).getStringCellValue().trim();

            // ✅ Check if email already exists in the database
            if (userRepository.existsByEmail(email)) {
                throw new IllegalArgumentException("Email already exists: " + email);
            }

            User user = new User();
            user.setName(row.getCell(0).getStringCellValue());
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(row.getCell(2).getStringCellValue())); // Default password
            user.setPhone((long) row.getCell(3).getNumericCellValue());
            user.setAddress(row.getCell(4).getStringCellValue());

            // Fetch College by Name
            String collegeName = row.getCell(5).getStringCellValue().trim();
            CollegeLookup college = collegeRepository.findByName(collegeName);
            if (college == null) {
                throw new IllegalArgumentException("College not found: " + collegeName);
            }
            user.setCollege(college);

            // Assign Role (Default: STUDENT)
          //  String roleStr = row.getCell(5).getStringCellValue().trim();
           // try {
                user.setRole(Role.valueOf("STUDENT"));
//            } catch (Exception e) {
//                throw new IllegalArgumentException("Invalid role: " + roleStr);
//            }

            user.setActive(true);
            user.setCreatedAt(LocalDateTime.now());

            users.add(user);
        }

        workbook.close();
        return users;
    }
    
//    public List<User> parseExcelFile(MultipartFile file) throws Exception {
//        List<User> users = new ArrayList<>();
//        InputStream inputStream = file.getInputStream();
//        Workbook workbook = WorkbookFactory.create(inputStream);
//        Sheet sheet = workbook.getSheetAt(0); // Read first sheet
//
//        for (Row row : sheet) {
//            if (row.getRowNum() == 0) continue; // Skip header row
//
//            User user = new User();
//            user.setName(row.getCell(0).getStringCellValue());
//            user.setEmail(row.getCell(1).getStringCellValue());
//            user.setPassword("defaultPassword"); // Default password
//            user.setPhone((long) row.getCell(2).getNumericCellValue());
//            user.setAddress(row.getCell(3).getStringCellValue());
//
//            // Fetch College by Name
//            String collegeName = row.getCell(4).getStringCellValue();
//            CollegeLookup college = collegeRepository.findByName(collegeName);
//            user.setCollege(college);
//
//            // Assign Role (Default: STUDENT)
//            String roleStr = row.getCell(5).getStringCellValue();
//            user.setRole(Role.valueOf(roleStr.toUpperCase()));
//
//            user.setActive(true);
//            user.setCreatedAt(LocalDateTime.now());
//
//            users.add(user);
//        }
//        workbook.close();
//        return users;
//    }
}
