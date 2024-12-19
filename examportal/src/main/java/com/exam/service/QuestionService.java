package com.exam.service;

import com.exam.model.Question;
import com.exam.repository.QuestionRepository;

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

    private final QuestionRepository questionRepository;

    @Autowired
    public QuestionService(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    public Resource getImage(Long id, String name) {
    	
       Path filePath = Paths.get("questions"+"/"+id+"/"+name);
       System.out.println(filePath);
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

            return questionRepository.save(question);

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

    public Optional<Question> getQuestionById(Long id) {
        return questionRepository.findById(id);
    }

    public void deleteQuestion(Long id) {
        questionRepository.deleteById(id);
    }

//    public Question updateQuestion(Long id, Question questionDetails) {
//        Optional<Question> optionalQuestion = questionRepository.findById(id);
//        if (optionalQuestion.isPresent()) {
//            Question question = optionalQuestion.get();
//            question.setQuestion(questionDetails.getQuestion());
//            question.setImage(questionDetails.getImage());
//            question.setOptionA(questionDetails.getOptionA());
//            question.setAImage(questionDetails.isAImage());
//            question.setOptionB(questionDetails.getOptionB());
//            question.setBImage(questionDetails.isBImage());
//            question.setOptionC(questionDetails.getOptionC());
//            question.setCImage(questionDetails.isCImage());
//            question.setOptionD(questionDetails.getOptionD());
//            question.setDImage(questionDetails.isDImage());
//            question.setCorrectAnswer(questionDetails.getCorrectAnswer());
//            question.setDifficulty(questionDetails.getDifficulty());
//            question.setCategory(questionDetails.getCategory());
//
//            return questionRepository.save(question);
//        }
//        return null;
//    }
}
