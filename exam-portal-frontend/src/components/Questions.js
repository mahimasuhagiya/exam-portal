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
        }
    };

    // Handle input change
    const handleInputChange = (e) => {
        if (e.target == undefined) {
            setNewQuestion((prev) => ({ ...prev, correctAnswer: e }));
        }
        else {
            const { name, value, type, checked, files } = e.target;
            if (name === "category" || name === "difficulty") {
                const options = name === "category" ? categoryOptions : difficultyOptions;
                const selectedOption = options.find((option) => option.id == value);
                if (selectedOption) {
                    setNewQuestion((prev) => ({ ...prev, [name]: { id: value, name: selectedOption.name } }));
                }
            }
            else if (type === "checkbox") {
                setNewQuestion((prev) => ({ ...prev, [name]: checked }));
            } else if (type === "file") {
                setNewQuestion((prev) => ({ ...prev, [name]: files[0] }));
            } else {
                setNewQuestion((prev) => ({ ...prev, [name]: value }));
            }
        }
    };

    // Handle file change
    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setNewQuestion((prev) => ({ ...prev, [name]: files[0] }));
    };

    // Save question (Add/Edit)
    const saveQuestion = async () => {
        if (!newQuestion.question || !newQuestion.difficulty.id || !newQuestion.category.id || !newQuestion.correctAnswer) {
            toast.warn("Please fill out all required fields.");
            return;
        }
        if (isProgramming == 0 && !((newQuestion.optionA || newQuestion.optionAImage) && (newQuestion.optionB || newQuestion.optionBImage))) {
            toast.warn("Please enter at least 2 options: A and B");
            return;
        }

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
    ).sort((a, b) => b.id - a.id);

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
                <button className="btn btn-primary mb-4" onClick={() => toggleModal(true)}>
                    Add Question
                </button>
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
                                <label>Question:</label>
                                <textarea
                                    className="form-control"
                                    name="question"
                                    value={newQuestion.question}
                                    onChange={handleInputChange}
                                />
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
                                <label>Difficulty:</label>
                                <select
                                    className="form-control"
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
                            </div>

                            <div className="form-group">
                                <label>Category:</label>
                                <select
                                    className="form-control"
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
                                                    className="form-control"
                                                    name={`option${option}`}
                                                    value={newQuestion[`option${option}`]}
                                                    onChange={handleInputChange}
                                                ></textarea>
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}
                            {isProgramming == 1 && (
                                <div className="form-group">
                                    <label>Correct Answer:</label>
                                    <ReactQuill
                                        name="correctAnswer"
                                        value={newQuestion.correctAnswer}
                                        onChange={handleInputChange}
                                        theme="snow"
                                        placeholder="Write your code here..."
                                    />
                                </div>
                            )}
                            {isProgramming == 0 && (
                                <div className="form-group">
                                    <label>Correct Answer:</label>
                                    <div>
                                        {["A", "B", "C", "D"].map((option, index) => (
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
