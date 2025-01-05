package com.exam.service;

import com.exam.model.Question;
import com.exam.repository.ExamQuestionRepository;
import com.exam.repository.QuestionRepository;
import com.exam.repository.QuestionsAttemptRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@Service
public class QuestionService {
	@Autowired
    private QuestionRepository questionRepository;
	@Autowired
    private ExamQuestionRepository examQuestionRepository;
	@Autowired
    private QuestionsAttemptRepository questionsAttemptRepository;
    public Resource getImage(Long id, String name) {
    	
       Path filePath = Paths.get("questions"+"/"+id+"/"+name);
        try {
            Resource resource = new UrlResource(filePath.toUri());
            return resource;
        } catch (MalformedURLException e) {
            throw new RuntimeException("Failed to load image", e);
        }
    }

    public Question saveQuestion(
            Question question,
            MultipartFile questionImage,
            MultipartFile optionAImage,
            MultipartFile optionBImage,
            MultipartFile optionCImage,
            MultipartFile optionDImage) throws Exception {

        try {
        	// saving the question before images so we can use question id to store images 
        	  Question savedQuestion = questionRepository.save(question);

            // Save question image
            if (questionImage != null && !questionImage.isEmpty()) {
            	savedQuestion.setImage(saveFile(questionImage, savedQuestion.getId(), "question"));
            }

            // Save option images
            if (optionAImage != null && !optionAImage.isEmpty()) {
            	savedQuestion.setOptionA(saveFile(optionAImage, savedQuestion.getId(), "optionA"));
                savedQuestion.setAImage(true);
            }
            if (optionBImage != null && !optionBImage.isEmpty()) {
            	savedQuestion.setOptionB(saveFile(optionBImage, savedQuestion.getId(),"optionB"));
            	savedQuestion.setBImage(true);
            }
            if (optionCImage != null && !optionCImage.isEmpty()) {
            	savedQuestion.setOptionC(saveFile(optionCImage, savedQuestion.getId(),"optionC"));
            	savedQuestion.setCImage(true);
            }
            if (optionDImage != null && !optionDImage.isEmpty()) {
            	savedQuestion.setOptionD(saveFile(optionDImage, savedQuestion.getId(),"optionD"));
            	savedQuestion.setDImage(true);
            }

            return questionRepository.save(savedQuestion);

        } catch (IOException e) {
            throw new Exception("File saving error: " + e.getMessage(), e);
        }
    }

    private String saveFile(MultipartFile file, Long questionId,String imageName) throws IOException {
        String fileName = file.getOriginalFilename();
        String extension = null;
        if (fileName != null && fileName.lastIndexOf('.') != -1 && fileName.lastIndexOf('.') < fileName.length() - 1) {
            extension = fileName.substring(fileName.lastIndexOf('.') + 1);
        }
        Path filePath = Paths.get("questions/"+ questionId+"/"+ imageName +"." +extension);
        Files.createDirectories(filePath.getParent());
        Files.write(filePath, file.getBytes());
        return filePath.toString();
    }

    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }

    
    public List<Question> getAllQuestionsByType(Boolean isProgramming) {
        return questionRepository.findByIsProgramming(isProgramming);
    }

    public Optional<Question> getQuestionById(Long id) {
        return questionRepository.findById(id);
    }

    public void deleteQuestion(Long id) {
    	if(examQuestionRepository.findByQuestion_Id(id) != null) { 		
    		throw new RuntimeException("Question is already used in exams. First remove this question from exam.");
    	}
        questionRepository.deleteById(id);
    }

    public Question updateQuestion(Question question,
            MultipartFile questionImage,
            MultipartFile optionAImage,
            MultipartFile optionBImage,
            MultipartFile optionCImage,
            MultipartFile optionDImage) throws Exception {

        try {
        	if(questionsAttemptRepository.findByQuestion_Id(question.getId()) != 0) { 		
        		throw new RuntimeException("Question is used in exam which is alredy attempted by students so can not edit the question");
        	}
        	
            if (questionImage != null && !questionImage.isEmpty()) {
            	question.setImage(saveFile(questionImage, question.getId(), "question"));
            }

            // Save option images
            if (optionAImage != null && !optionAImage.isEmpty()) {
            	question.setOptionA(saveFile(optionAImage, question.getId(), "optionA"));
            	question.setAImage(true);
            }
            if (optionBImage != null && !optionBImage.isEmpty()) {
            	question.setOptionB(saveFile(optionBImage, question.getId(),"optionB"));
            	question.setBImage(true);
            }
            if (optionCImage != null && !optionCImage.isEmpty()) {
            	question.setOptionC(saveFile(optionCImage, question.getId(),"optionC"));
            	question.setCImage(true);
            }
            if (optionDImage != null && !optionDImage.isEmpty()) {
            	question.setOptionD(saveFile(optionDImage, question.getId(),"optionD"));
            	question.setDImage(true);
            }

            return questionRepository.save(question);

        } catch (IOException e) {
            throw new Exception("File saving error: " + e.getMessage(), e);
        }
    }

}
