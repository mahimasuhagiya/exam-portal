import axios from "axios";
import React, { useEffect, useState } from "react";
import API_URL from "../services/authService";
import { toast, ToastContainer } from "react-toastify";
import { DataGrid } from "@mui/x-data-grid";
import { Modal } from "reactstrap";
import showToastConfirmation from "./toast";
import "../css/styles.css";

const Question = () => {
    const [questionData, setQuestionData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [difficultyOptions, setDifficultyOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [searchText, setSearchText] = useState("");
    const getRowHeight = () => "auto";
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
    const token = localStorage.getItem("jwtToken");

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
        }
    };

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (name === "category" || name === "difficulty") {
            const options = name === "category" ? categoryOptions : difficultyOptions;
            const selectedOption = options.find((option) => option.id == value);
            if (selectedOption) {
                setNewQuestion((prev) => ({ ...prev, [name]: { id: value, name: selectedOption.name } }));
            }
        } else if (type === "checkbox") {
            setNewQuestion((prev) => ({ ...prev, [name]: checked }));
        } else if (type === "file") {
            setNewQuestion((prev) => ({ ...prev, [name]: files[0] }));
        } else {
            setNewQuestion((prev) => ({ ...prev, [name]: value }));
        }
    };

    // Handle file change
    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setNewQuestion((prev) => ({ ...prev, [name]: files[0] }));
    };

    // Save question (Add/Edit)
    const saveQuestion = async () => {
        if (!newQuestion.question || !newQuestion.difficulty.id || !newQuestion.category.id || !newQuestion.correctAnswer
             || !newQuestion.optionA) {
            toast.warn("Please fill out all required fields.");
            return;
        }
        const formData = new FormData();
        formData.append("question", JSON.stringify({
            id: newQuestion.id || null,
            question: newQuestion.question,
            optionA: newQuestion.optionA,
            optionB: newQuestion.optionB,
            optionC: newQuestion.optionC,
            optionD: newQuestion.optionD,
            aimage: newQuestion.isAImage,
            bimage: newQuestion.isBImage,
            cimage: newQuestion.isCImage,
            dimage: newQuestion.isDImage,
            correctAnswer: newQuestion.correctAnswer,
            category: { "id": newQuestion.category.id, "name": newQuestion.category.name },
            difficulty: { "id": newQuestion.difficulty.id, "name": newQuestion.difficulty.name }
        }));
        formData.append("imagee", newQuestion.image);
        formData.append("optionAImage", newQuestion.optionAImage);
        formData.append("optionBImage", newQuestion.optionBImage);
        formData.append("optionCImage", newQuestion.optionCImage);
        formData.append("optionDImage", newQuestion.optionDImage);

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
                toast.error("Error saving question. Please try again.");
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
                toast.error("Error deleting question. Please try again.");
            }
        };

        showToastConfirmation("delete", "Question", deleteCallback);
    };

    // Open Edit Form
    const openEditForm = (question) => {
        setSelectedQuestion(question);
        setIsEditing(true);
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

    // Columns for DataGrid
    const columns = [
        { field: "id", headerName: "ID", width: 50,renderCell: (params) => (<div style={{ whiteSpace: "normal",wordWrap: "break-word",overflow: "hidden",textOverflow: "ellipsis",}}>{params.value}</div>), },
        { field: "question", headerName: "Question", flex: 2,renderCell: (params) => (<div style={{ whiteSpace: "normal",wordWrap: "break-word",overflow: "hidden",textOverflow: "ellipsis",}}>{params.value}</div>), },
        {
            field: "image",
            headerName: "Question Image",
            flex: 1,
            renderCell: (params) => (<div style={{ whiteSpace: "normal",wordWrap: "break-word",overflow: "hidden",textOverflow: "ellipsis",}}>
              {  params.value ? <img src={`${API_URL}/${params.value}`} alt="Question" style={{ maxWidth: "50px", maxHeight: "50px" }} /> : "N/A"}
                </div>
            )
        },
        {
            field: "optionA",
            headerName: "Option A",
            flex: 1,
            renderCell: (params) => (<div style={{ whiteSpace: "normal",wordWrap: "break-word",overflow: "hidden",textOverflow: "ellipsis",}}>
                {params.row.aimage ? <img src={`${API_URL}/${params.value}`} alt="Option A" style={{ maxWidth: "50px", maxHeight: "50px" }} /> : params.value || "N/A"}
                </div>
            )
        },
        {
            field: "optionB",
            headerName: "Option B",
            flex: 1,
            renderCell: (params) => (<div style={{ whiteSpace: "normal",wordWrap: "break-word",overflow: "hidden",textOverflow: "ellipsis",}}>
                {params.row.bimage ? <img src={`${API_URL}/${params.value}`} alt="Option B" style={{ maxWidth: "50px", maxHeight: "50px" }} /> : params.value || "N/A"}
                </div>
            )
        },
        {
            field: "optionC",
            headerName: "Option C",
            flex: 1,
            renderCell: (params) => (<div style={{ whiteSpace: "normal",wordWrap: "break-word",overflow: "hidden",textOverflow: "ellipsis",}}>
                {params.row.cimage ? <img src={`${API_URL}/${params.value}`} alt="Option C" style={{ maxWidth: "50px", maxHeight: "50px" }} /> : params.value || "N/A"}
                </div>
            )
        },
        {
            field: "optionD",
            headerName: "Option D",
            flex: 1,
            renderCell: (params) => (<div style={{ whiteSpace: "normal",wordWrap: "break-word",overflow: "hidden",textOverflow: "ellipsis",}}>
                {params.row.dimage ? <img src={`${API_URL}/${params.value}`} alt="Option D" style={{ maxWidth: "50px", maxHeight: "50px" }} /> : params.value || "N/A"}
          </div>
            )
        },
        { field: "correctAnswer", headerName: "Correct Answer", flex: 1 },
        {
            field: "difficulty",
            headerName: "Difficulty",
            flex: 1,
            renderCell: (params) => params.value?.name || "N/A"
        },
        {
            field: "category",
            headerName: "Category",
            flex: 1,
            renderCell: (params) => params.value?.name || "N/A"
        },
        {
            field: "actions",
            headerName: "Actions",
            width:120,
            renderCell: (params) => (
                <div>
                    <button
                        className="btn btn-primary btn-sm mr-2"
                        onClick={() => openEditForm(params.row)}
                    >
                        Edit
                    </button>&nbsp;
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteQuestion(params.row.id)}
                    >
                        Delete
                    </button>
                </div>
            ),
        },
    ];

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
                    style={{    height: "63px"}}
                    onChange={(e) => setSearchText(e.target.value)}
                />
                <button className="btn btn-primary mb-4" onClick={() => toggleModal(true)}>
                    Add Question
                </button>
            </div>
            {/* DataGrid */}
            <div style={{ width: "100%" }}>
                <DataGrid
                    rows={questionData}
                    columns={columns}
                    pageSize={10}
                    getRowHeight={getRowHeight} // Dynamic row height for wrapping
    
                    rowsPerPageOptions={[5, 10, 15]}
                />
            </div>

            {/* Modal */}
            <Modal isOpen={isModalOpen} className="modal-lg" toggle={() => toggleModal(true)}>
                <div className="modal-content">
                    <div className="modal-header">
                        {isEditing ? "Edit Question" : "Add Question"}
                    </div>
                    <div className="modal-body">
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

                            <div className="form-group">
                                <label>Correct Answer:</label>
                                <div>
                                    <label>
                                        <input
                                            type="radio"
                                            name="correctAnswer"
                                            value={1}
                                            checked={newQuestion.correctAnswer == 1}
                                            onChange={handleInputChange}
                                        />
                                        Option A
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="correctAnswer"
                                            value={2}
                                            checked={newQuestion.correctAnswer == 2}
                                            onChange={handleInputChange}
                                        />
                                        Option B
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="correctAnswer"
                                            value={3}
                                            checked={newQuestion.correctAnswer == 3}
                                            onChange={handleInputChange}
                                        />
                                        Option C
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="correctAnswer"
                                            value={4}
                                            checked={newQuestion.correctAnswer == 4}
                                            onChange={handleInputChange}
                                        />
                                        Option D
                                    </label>
                                </div>
                            </div>
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
