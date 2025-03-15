import axios from "axios";
import React, { useEffect, useState } from "react";
import API_URL, { getWithExpiry } from "../services/authService";
import { toast, ToastContainer } from "react-toastify";
import { DataGrid } from "@mui/x-data-grid";
import { Modal, Row } from "reactstrap";
import showToastConfirmation from "./toast";
import { Card, CardBody, CardTitle, CardText, Button } from "reactstrap";
import "../css/styles.css";
import ReactQuill from "react-quill";
import Papa from "papaparse";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faFileCsv, 
    faFileExcel, 
    faFilePdf 
} from "@fortawesome/free-solid-svg-icons";
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

const Question = () => {
    const [questionData, setQuestionData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [difficultyOptions, setDifficultyOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [searchText, setSearchText] = useState("");
    const getRowHeight = () => "auto";
    const [isProgramming, setQuestionType] = useState(0);
    const [newQuestion, setNewQuestion] = useState({
        question: "",
        isAImage: false,
        optionA: "",
        isBImage: false,
        optionB: "",
        isCImage: false,
        optionC: "",
        isDImage: false,
        optionD: "",
        correctAnswer: "",
        image: null,
        optionAImage: null,
        optionBImage: null,
        optionCImage: null,
        optionDImage: null,
        difficulty: { id: null, name: "" },
        category: { id: null, name: "" },
    });
    const [errors, setErrors] = useState({}); // State for validation errors
    const token = getWithExpiry("jwtToken");

    const fetchOptions = async () => {
        try {
            const difficultyResponse = await axios.get(`${API_URL}/difficulty`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            setDifficultyOptions(difficultyResponse.data || []);

            const categoryResponse = await axios.get(`${API_URL}/question_categories`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            setCategoryOptions(categoryResponse.data || []);
        } catch (error) {
            toast.error("Error fetching difficulty or category options!");
        }
    };

    const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
    const toggleExportDropdown = () => setExportDropdownOpen(prev => !prev);

    const exportToCSV = () => {
        try {
            const formattedData = questionData.map((question) => ({
                ID: question.id,
                Question: question.question,
                Category: question.category?.name || "N/A",
                Difficulty: question.difficulty?.name || "N/A",
                Type: question.programming ? "Programming" : "MCQ",
                CorrectAnswer: question.correctAnswer,
                OptionA: question.optionA || "N/A",
                OptionB: question.optionB || "N/A",
                OptionC: question.optionC || "N/A",
                OptionD: question.optionD || "N/A",
                HasImage: question.image ? "Yes" : "No",
            }));

            const csv = Papa.unparse(formattedData);
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "questions.csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("CSV file downloaded successfully!");
        } catch (error) {
            toast.error("Error exporting CSV!");
        }
    };

    const exportToExcel = () => {
        try {
            const worksheet = XLSX.utils.json_to_sheet(
                questionData.map((question) => ({
                    ID: question.id,
                    Question: question.question,
                    Category: question.category?.name || "N/A",
                    Difficulty: question.difficulty?.name || "N/A",
                    Type: question.programming ? "Programming" : "MCQ",
                    "Correct Answer": question.correctAnswer,
                    "Option A": question.optionA || "N/A",
                    "Option B": question.optionB || "N/A",
                    "Option C": question.optionC || "N/A",
                    "Option D": question.optionD || "N/A",
                    "Has Image": question.image ? "Yes" : "No",
                    "Created At": new Date(question.createdAt).toLocaleString("en-GB")
                }))
            );
    
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Questions");
            XLSX.writeFile(workbook, "questions.xlsx");
            toast.success("Excel file downloaded successfully!");
        } catch (error) {
            toast.error("Error exporting Excel file!");
        }
    };
    
    const exportToPDF = () => {
        try {
            const doc = new jsPDF();
            let yPos = 20;
            
            questionData.forEach((question, index) => {
                if (index !== 0 && yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }
                
                doc.setFontSize(12);
                doc.text(`ID: ${question.id}`, 20, yPos);
                doc.text(`Question: ${question.question}`, 20, yPos + 10);
                doc.text(`Category: ${question.category?.name || "N/A"}`, 20, yPos + 20);
                doc.text(`Difficulty: ${question.difficulty?.name || "N/A"}`, 20, yPos + 30);
                doc.text(`Type: ${question.programming ? "Programming" : "MCQ"}`, 20, yPos + 40);
                doc.text(`Correct Answer: ${question.correctAnswer}`, 20, yPos + 50);
                
                yPos += 60;
                
                if (question.image) {
                    doc.text("Question Image: Available", 20, yPos);
                    yPos += 10;
                }
                
                if (!question.programming) {
                    doc.text(`Options:`, 20, yPos);
                    yPos += 10;
                    doc.text(`A: ${question.optionA || "N/A"}`, 30, yPos);
                    doc.text(`B: ${question.optionB || "N/A"}`, 80, yPos);
                    doc.text(`C: ${question.optionC || "N/A"}`, 130, yPos);
                    doc.text(`D: ${question.optionD || "N/A"}`, 180, yPos);
                    yPos += 10;
                }
                
                yPos += 20;
            });
    
            doc.save("questions.pdf");
            toast.success("PDF file downloaded successfully!");
        } catch (error) {
            toast.error("Error exporting PDF!");
        }
    };
    

    // Fetch question data
    useEffect(() => {
        const fetchQuestions = async () => {
            if (!token) return;
            try {
                const response = await axios.get(`${API_URL}/questions`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                setQuestionData(response.data);
            } catch (error) {
                toast.error("Error fetching questions data!");
            }
        };

        fetchQuestions();
        fetchOptions();
    }, [token]);

    // Toggle modal and reset form if it's not open
    const toggleModal = (flag) => {
        fetchOptions();
        setIsModalOpen(!isModalOpen);
        if (flag) {
            setNewQuestion({
                question: "",
                isAImage: false,
                optionA: "",
                isBImage: false,
                optionB: "",
                isCImage: false,
                optionC: "",
                isDImage: false,
                optionD: "",
                correctAnswer: "",
                image: null,
                optionAImage: null,
                optionBImage: null,
                optionCImage: null,
                optionDImage: null,
                difficulty: { id: null, name: "" },
                category: { id: null, name: "" },
            });
            setIsEditing(false);
            setQuestionType(0);
            setErrors({}); // Reset validation errors
        }
    };

   // Handle input change
const handleInputChange = (e) => {
    let fieldName; // Declare fieldName outside the block

    if (e.target === undefined) {
        // Handle ReactQuill case (correctAnswer)
        setNewQuestion((prev) => ({ ...prev, correctAnswer: e }));
        fieldName = "correctAnswer"; // Explicitly set fieldName for this case
    } else {
        // Destructure name as fieldName from e.target
        const { name: fieldNameDestructured, value, type, checked, files } = e.target;
        fieldName = fieldNameDestructured; // Assign to the outer variable

        if (fieldName === "category" || fieldName === "difficulty") {
            const options = fieldName === "category" ? categoryOptions : difficultyOptions;
            const selectedOption = options.find((option) => option.id == value);
            if (selectedOption) {
                setNewQuestion((prev) => ({ ...prev, [fieldName]: { id: value, name: selectedOption.name } }));
            }
        } else if (type === "checkbox") {
            setNewQuestion((prev) => ({ ...prev, [fieldName]: checked }));
        } else if (type === "file") {
            setNewQuestion((prev) => ({ ...prev, [fieldName]: files[0] }));
        } else {
            setNewQuestion((prev) => ({ ...prev, [fieldName]: value }));
        }
    }

    // Clear the error for the field when it changes
    setErrors((prev) => ({ ...prev, [fieldName]: "" }));
};
    // Handle file change
    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setNewQuestion((prev) => ({ ...prev, [name]: files[0] }));
    };

    // Validate form fields
    const validateForm = () => {
        const newErrors = {};
        if (!newQuestion.question) newErrors.question = "Question is required";
        if (!newQuestion.difficulty.id) newErrors.difficulty = "Difficulty is required";
        if (!newQuestion.category.id) newErrors.category = "Category is required";
        if (!newQuestion.correctAnswer) newErrors.correctAnswer = "Correct answer is required";

        if (isProgramming === 0) {
            if (!newQuestion.optionA && !newQuestion.optionAImage) newErrors.optionA = "Option A is required";
            if (!newQuestion.optionB && !newQuestion.optionBImage) newErrors.optionB = "Option B is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Save question (Add/Edit)
    const saveQuestion = async () => {
        if (!validateForm()) return; // Stop if validation fails

        const formData = new FormData();
        formData.append("question", JSON.stringify({
            id: newQuestion.id || null,
            question: newQuestion.question,
            image: isEditing ? newQuestion.image : null,
            optionA: isProgramming ? null : newQuestion.optionA,
            optionB: isProgramming ? null : newQuestion.optionB,
            optionC: isProgramming ? null : newQuestion.optionC,
            optionD: isProgramming ? null : newQuestion.optionD,
            aimage: isProgramming ? null : newQuestion.isAImage,
            bimage: isProgramming ? null : newQuestion.isBImage,
            cimage: isProgramming ? null : newQuestion.isCImage,
            dimage: isProgramming ? null : newQuestion.isDImage,
            programming: isProgramming == 1 ? true : false,
            correctAnswer: newQuestion.correctAnswer,
            category: { "id": newQuestion.category.id, "name": newQuestion.category.name },
            difficulty: { "id": newQuestion.difficulty.id, "name": newQuestion.difficulty.name }
        }));
        formData.append("questionImage", newQuestion.image);
        formData.append("optionBImage", isProgramming ? null : newQuestion.optionBImage);
        formData.append("optionCImage", isProgramming ? null : newQuestion.optionCImage);
        formData.append("optionDImage", isProgramming ? null : newQuestion.optionDImage);
        formData.append("optionAImage", isProgramming ? null : newQuestion.optionAImage);

        const saveCallback = async () => {
            try {
                if (isEditing) {
                    await axios.put(`${API_URL}/questions`, formData, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "multipart/form-data",
                        },
                    });
                    setQuestionData((prev) =>
                        prev.map((question) =>
                            question.id === selectedQuestion.id ? { ...selectedQuestion, ...newQuestion } : question
                        )
                    );
                    toast.success("Question updated successfully!");
                } else {
                    const response = await axios.post(`${API_URL}/questions`, formData, {
                        headers: {
                            "Content-Type": "multipart/form-data",
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    setQuestionData([...questionData, response.data]);
                    toast.success("Question added successfully!");
                }

                toggleModal(true);
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred.";
                toast.error(errorMessage);
            }
        };

        showToastConfirmation(isEditing ? "update" : "add", "Question", saveCallback);
    };

    // Delete Question
    const deleteQuestion = (id) => {
        const deleteCallback = async () => {
            try {
                await axios.delete(`${API_URL}/questions/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                setQuestionData((prev) => prev.filter((question) => question.id !== id));
                toast.success("Question deleted successfully!");
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred.";
                toast.error(errorMessage);
            }
        };

        showToastConfirmation("delete", "Question", deleteCallback);
    };

    const handleQuestionTypeChange = (e) => {
        setQuestionType(e.target.value);
    };

    // Open Edit Form
    const openEditForm = (question) => {
        setSelectedQuestion(question);
        setIsEditing(true);
        setQuestionType(question.programming == true ? 1 : 0);
        setNewQuestion({
            id: question.id,
            question: question.question,
            isAImage: question.aimage,
            optionA: question.optionA,
            isBImage: question.bimage,
            optionB: question.optionB,
            isCImage: question.cimage,
            optionC: question.optionC,
            isDImage: question.dimage,
            optionD: question.optionD,
            correctAnswer: question.correctAnswer,
            image: question.image || null,
            optionCImage: question.optionCImage || null,
            optionAImage: question.optionAImage || null,
            optionBImage: question.optionBImage || null,
            optionDImage: question.optionDImage || null,
            difficulty: question.difficulty,
            category: question.category,
        });
        toggleModal(false);
    };

    // Filter data based on search
    const filteredData = questionData.filter((question) =>
        question.question?.toLowerCase().includes(searchText.toLowerCase()) ||
        question.difficulty?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        question.category?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        question.optionA?.toLowerCase().includes(searchText.toLowerCase()) ||
        question.optionB?.toLowerCase().includes(searchText.toLowerCase()) ||
        question.optionC?.toLowerCase().includes(searchText.toLowerCase()) ||
        question.optionD?.toLowerCase().includes(searchText.toLowerCase())
    ).sort((a, b) => a.id - b.id);

    // Get available options for correct answer
    const getAvailableOptions = () => {
        const options = [];
        if (newQuestion.optionA || newQuestion.optionAImage) options.push("A");
        if (newQuestion.optionB || newQuestion.optionBImage) options.push("B");
        if (newQuestion.optionC || newQuestion.optionCImage) options.push("C");
        if (newQuestion.optionD || newQuestion.optionDImage) options.push("D");
        return options;
    };

    return (
        <div>
            <ToastContainer />
            <h1 className="text-center mb-4">Question Management</h1>

            {/* Search Input */}
            <div className="d-flex justify-content-between mb-4">
                <input
                    type="text"
                    placeholder="Search Questions"
                    className="form-control"
                    value={searchText}
                    style={{ height: "63px" }}
                    onChange={(e) => setSearchText(e.target.value)}
                />
                
                    <button 
                        className="btn btn-primary ml-4" 
                        onClick={() => toggleModal(true)}
                    >
                        Add Question
                    </button>
       
        <Dropdown 
            isOpen={exportDropdownOpen} 
            toggle={toggleExportDropdown} 
        >
            <DropdownToggle className="btn btn-success ml-4" style={{ height: "63px" }}>
                Export
            </DropdownToggle>
            <DropdownMenu>
                <DropdownItem onClick={exportToCSV}>
                    <FontAwesomeIcon icon={faFileCsv} className="mr-2" />
                    CSV
                </DropdownItem>
                <DropdownItem onClick={exportToExcel}>
                    <FontAwesomeIcon icon={faFileExcel} className="mr-2" />
                    Excel
                </DropdownItem>
                <DropdownItem onClick={exportToPDF}>
                    <FontAwesomeIcon icon={faFilePdf} className="mr-2" />
                    PDF
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
               
            </div>
            <div style={{ padding: "20px" }}>
                {filteredData.length == 0 ?
                    <Card style={{
                        width: "100%",
                        margin: "10px auto",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        borderRadius: "10px",
                    }}>
                        <CardBody style={{ textAlign: "center", margin: "10px" }}>
                            <i className="fas fa-exclamation-triangle" ></i> No Questions yet.
                        </CardBody>
                    </Card>
                    :
                    filteredData.map((question) => (
                        <Card
                            key={question.id}
                            style={{
                                width: "100%",
                                margin: "10px auto",
                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                borderRadius: "10px",
                            }}
                        >
                            <CardBody>
                                <CardTitle style={{ fontWeight: "bold", marginBottom: "10px" }}>
                                    ID: {question.id} - {question.question}
                                </CardTitle>

                                {question.image && (
                                    <div style={{ textAlign: "center", marginBottom: "10px" }}>
                                        <img
                                            src={`${API_URL}/${question.image}`}
                                            alt="Question"
                                            style={{ maxWidth: "100%", maxHeight: "100px" }}
                                        />
                                    </div>
                                )}
                                {question.programming == false &&
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                                        {question.optionB &&
                                            <CardText>
                                                <strong>Option A:</strong>{" "}
                                                {question.aimage ? (
                                                    <img
                                                        src={`${API_URL}/${question.optionA}`}
                                                        alt="Option A"
                                                        style={{ maxWidth: "50px", maxHeight: "50px" }}
                                                    />
                                                ) : (
                                                    question.optionA
                                                )}
                                            </CardText>
                                        }
                                        {question.optionB &&
                                            <CardText>
                                                <strong>Option B:</strong>{" "}
                                                {question.bimage ? (
                                                    <img
                                                        src={`${API_URL}/${question.optionB}`}
                                                        alt="Option B"
                                                        style={{ maxWidth: "50px", maxHeight: "50px" }}
                                                    />
                                                ) : (
                                                    question.optionB
                                                )}
                                            </CardText>
                                        }
                                        {question.optionC &&
                                            <CardText>
                                                <strong>Option C:</strong>{" "}
                                                {question.cimage ? (
                                                    <img
                                                        src={`${API_URL}/${question.optionC}`}
                                                        alt="Option C"
                                                        style={{ maxWidth: "50px", maxHeight: "50px" }}
                                                    />
                                                ) : (
                                                    question.optionC
                                                )}
                                            </CardText>
                                        }
                                        {question.optionD &&
                                            <CardText>
                                                <strong>Option D:</strong>{" "}
                                                {question.dimage ? (
                                                    <img
                                                        src={`${API_URL}/${question.optionD}`}
                                                        alt="Option D"
                                                        style={{ maxWidth: "50px", maxHeight: "50px" }}
                                                    />
                                                ) : (
                                                    question.optionD
                                                )}
                                            </CardText>
                                        }
                                    </div>
                                }
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: "10px",
                                        flexWrap: "nowrap",
                                        overflow: "hidden",
                                    }}
                                >
                                    <CardText style={{ flex: "1 1 auto", whiteSpace: "normal", wordWrap: "break-word" }}>
                                        <strong>Correct Answer:</strong>
                                        <div
                                            style={{
                                                whiteSpace: 'pre-wrap',
                                                wordBreak: 'break-word',
                                            }}
                                            dangerouslySetInnerHTML={{ __html: question.correctAnswer || "Not answered" }}
                                        />
                                    </CardText>

                                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "nowrap" }}>
                                        <div style={{ marginRight: "10px" }}>
                                            <strong>Category:</strong> {question.category?.name || "N/A"}&nbsp;
                                        </div>
                                        <div>
                                            <strong>Difficulty:</strong> {question.difficulty?.name || "N/A"}&nbsp;
                                        </div>
                                    </div>

                                    <div>
                                        <Button
                                            color="primary"
                                            size="sm"
                                            style={{ marginRight: "5px" }}
                                            onClick={() => openEditForm(question)}
                                        >
                                            Edit
                                        </Button>&nbsp;
                                        <Button color="danger" size="sm" onClick={() => deleteQuestion(question.id)}>
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))
                }
            </div>

            {/* Modal */}
            <Modal isOpen={isModalOpen} className="modal-lg" toggle={() => toggleModal(true)}>
                <div className="modal-content">
                    <div className="modal-header">
                        {isEditing ? "Edit Question" : "Add Question"}
                    </div>
                    <div className="modal-body">
                        {/* Question Type Toggle */}
                        <div className="form-group">
                            <label>Question Type:</label>
                            <div className="d-flex">
                                <label>
                                    <input
                                        type="radio"
                                        name="isProgramming"
                                        value="0"
                                        checked={isProgramming == 0}
                                        onChange={handleQuestionTypeChange}
                                    />
                                    MCQ
                                </label>
                                <label className="ml-4">
                                    <input
                                        type="radio"
                                        name="isProgramming"
                                        value="1"
                                        checked={isProgramming == 1}
                                        onChange={handleQuestionTypeChange}
                                    />
                                    Programming
                                </label>
                            </div>
                        </div>

                        <form>
                            <div className="form-group">
                                <label>Question: *</label>
                                <textarea
                                    className={`form-control ${errors.question ? "is-invalid" : ""}`}
                                    name="question"
                                    value={newQuestion.question}
                                    onChange={handleInputChange}
                                />
                                {errors.question && <div className="invalid-feedback">{errors.question}</div>}
                            </div>
                            <div className="form-group">
                                <label>Question Image:</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    name="image"
                                    onChange={handleFileChange}
                                />
                                <img
                                    src={
                                        newQuestion.image instanceof File
                                            ? URL.createObjectURL(newQuestion.image)
                                            : newQuestion.image
                                                ? `${API_URL}/${newQuestion.image}`
                                                : null
                                    }
                                    alt="Question Preview"
                                    className="mt-2 img-thumbnail"
                                    width="150"
                                />
                            </div>

                            <div className="form-group">
                                <label>Difficulty: *</label>
                                <select
                                    className={`form-control ${errors.difficulty ? "is-invalid" : ""}`}
                                    name="difficulty"
                                    value={newQuestion.difficulty.id}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Difficulty</option>
                                    {difficultyOptions.map((difficulty) => (
                                        <option key={difficulty.id} value={difficulty.id}>
                                            {difficulty.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.difficulty && <div className="invalid-feedback">{errors.difficulty}</div>}
                            </div>

                            <div className="form-group">
                                <label>Category: *</label>
                                <select
                                    className={`form-control ${errors.category ? "is-invalid" : ""}`}
                                    name="category"
                                    value={newQuestion.category.id}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Category</option>
                                    {categoryOptions.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.category && <div className="invalid-feedback">{errors.category}</div>}
                            </div>

                            {isProgramming == 0 && (
                                <>
                                    {["A", "B", "C", "D"].map((option) => (
                                        <div key={option} className="form-group">
                                            <div className="d-flex align-items-center">
                                                <input
                                                    type="checkbox"
                                                    name={`is${option}Image`}
                                                    checked={newQuestion[`is${option}Image`]}
                                                    onChange={handleInputChange}
                                                    className="mr-2"
                                                />
                                                <span> Option {option} is an Image</span>
                                            </div>

                                            {newQuestion[`is${option}Image`] ? (
                                                <>
                                                    <input
                                                        type="file"
                                                        className="form-control"
                                                        name={`option${option}Image`}
                                                        onChange={(e) => handleFileChange(e)}
                                                    />
                                                    <img
                                                        src={
                                                            newQuestion[`option${option}Image`] instanceof File
                                                                ? URL.createObjectURL(newQuestion[`option${option}Image`])
                                                                : newQuestion[`option${option}`]
                                                                    ? `${API_URL}/${newQuestion[`option${option}`]}`
                                                                    : null
                                                        }
                                                        alt="Question Preview"
                                                        className="mt-2 img-thumbnail"
                                                        width="150"
                                                    />
                                                </>
                                            ) : (
                                                <textarea
                                                    className={`form-control ${errors[`option${option}`] ? "is-invalid" : ""}`}
                                                    name={`option${option}`}
                                                    value={newQuestion[`option${option}`]}
                                                    onChange={handleInputChange}
                                                ></textarea>
                                            )}
                                            {errors[`option${option}`] && <div className="invalid-feedback">{errors[`option${option}`]}</div>}
                                        </div>
                                    ))}
                                </>
                            )}

                            {isProgramming == 1 && (
                                <div className="form-group">
                                    <label>Correct Answer: *</label>
                                    <ReactQuill
                                        name="correctAnswer"
                                        value={newQuestion.correctAnswer}
                                        onChange={handleInputChange}
                                        theme="snow"
                                        placeholder="Write your code here..."
                                    />
                                    {errors.correctAnswer && <div className="invalid-feedback">{errors.correctAnswer}</div>}
                                </div>
                            )}

                            {isProgramming == 0 && (
                                <div className="form-group">
                                    <label>Correct Answer: *</label>
                                    <div>
                                        {getAvailableOptions().map((option) => (
                                            <label key={option}>
                                                <input
                                                    type="radio"
                                                    name="correctAnswer"
                                                    value={option}
                                                    checked={newQuestion.correctAnswer === option}
                                                    onChange={handleInputChange}
                                                />
                                                Option {option}
                                            </label>
                                        ))}
                                    </div>
                                    {errors.correctAnswer && <div className="invalid-feedback">{errors.correctAnswer}</div>}
                                </div>
                            )}
                        </form>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={() => toggleModal(true)}>
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={saveQuestion}>
                            {isEditing ? "Edit" : "Add"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Question;