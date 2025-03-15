import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL, { getWithExpiry } from "../services/authService";
import { toast, ToastContainer } from "react-toastify";
import { DataGrid } from "@mui/x-data-grid";
import { Modal } from "reactstrap";
import showToastConfirmation from "./toast";
import "../css/styles.css";
import Papa from "papaparse";
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCsv, faFileExcel, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";

const Exams = () => {
    const [examsData, setExamsData] = useState([]);
    const [questionData, setQuestionData] = useState([]);
    const [examQuestionData, setExamQuestionData] = useState([]);
    const [difficultiesData, setDifficultiesData] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [searchQuestionText, setQuestionSearchText] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);
    const [programming, setProgramming] = useState(false);
    const [newExam, setNewExam] = useState({
        title: "",
        difficulty: { id: "" },
        durationMinutes: "",
        numberOfQuestions: "",
        passingMarks: "",
        programming: false,
        active: true,
    });
    const [errors, setErrors] = useState({}); // State for validation errors
    const token = getWithExpiry("jwtToken");

    // Fetch exams data
    const fetchExams = async () => {
        if (!token) return;
        try {
            const response = await axios.get(`${API_URL}/exams`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            setExamsData(response.data);
        } catch (error) {
            toast.error("Error fetching exams data!");
        }
    };

    const fetchDifficulties = async () => {
        try {
            const response = await axios.get(`${API_URL}/difficulty`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            setDifficultiesData(response.data);
        } catch (error) {
            toast.error("Error fetching difficulties data!");
        }
    };

    const fetchQuestions = async (flag) => {
        try {
            const response = await axios.get(`${API_URL}/questions/programming/${flag}`, {
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

    const fetchExamQuestions = async (examId) => {
        try {
            const response = await axios.get(`${API_URL}/exam_questions/exam/${examId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            setExamQuestionData(response.data);
        } catch (error) {
            toast.error("Error fetching exam's questions!");
        }
    };

    useEffect(() => {
        fetchExams();
        fetchDifficulties();
    }, [token]);

    // Toggle modal and reset form
    const toggleModal = (flag) => {
        setIsModalOpen(!isModalOpen);
        if (flag) {
            setNewExam({
                title: "",
                difficulty: { id: "" },
                durationMinutes: "",
                numberOfQuestions: "",
                passingMarks: "",
                programming: false,
                active: true,
            });
            setIsEditing(false);
            setErrors({}); // Reset validation errors
        }
    };

    const toggleQuestionModal = (flag, exam) => {
        setIsQuestionModalOpen(!isQuestionModalOpen);
        if (flag === true) {
            setSelectedExam(exam);
            setProgramming(exam.programming);
            fetchExamQuestions(exam.id);
            fetchQuestions(exam.programming);
        }
    };

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === "difficulty") {
            setNewExam((prev) => ({ ...prev, difficulty: { id: value } }));
        } else if (type === "checkbox") {
            setNewExam((prev) => ({ ...prev, [name]: checked }));
        } else {
            setNewExam((prev) => ({ ...prev, [name]: value }));
        }
        // Clear the error for the field when it changes
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    // Validate form fields    
    const validateForm = () => {
        const newErrors = {};
        if (!newExam.title) newErrors.title = "Title is required";
        if (!newExam.difficulty.id) newErrors.difficulty = "Difficulty is required";
        if (!newExam.durationMinutes) newErrors.durationMinutes = "Duration is required";
        if (!newExam.numberOfQuestions) newErrors.numberOfQuestions = "Number of questions is required";
        if (!newExam.passingMarks) newErrors.passingMarks = "Passing marks is required";
        if ((newExam.passingMarks > newExam.numberOfQuestions || newExam.passingMarks < 0) && !newExam.programming) {
            newErrors.passingMarks = "Passing marks should be greater than 0 and less than or equal to the number of questions.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Save exam (Add/Edit)
    const saveExam = async () => {
        if (!validateForm()) return; // Stop if validation fails

        const saveCallback = async () => {
            try {
                if (isEditing) {
                    const response = await axios.put(`${API_URL}/exams`, newExam, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    });
                    setExamsData((prev) =>
                        prev.map((exam) =>
                            exam.id === selectedExam.id ? response.data : exam
                        )
                    );
                    toast.success("Exam updated successfully!");
                } else {
                    const response = await axios.post(`${API_URL}/exams`, newExam, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    });
                    setExamsData([...examsData, response.data]);
                    toast.success("Exam added successfully!");
                }

                toggleModal();
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred.";
                toast.error(errorMessage);
            }
        };

        showToastConfirmation(isEditing ? "update" : "add", "Exam", saveCallback);
    };
    // Save exam (Add/Edit)
    const saveExamWithQuestion = async () => {
        if (!newExam.title || !newExam.difficulty.id || !newExam.durationMinutes || !newExam.numberOfQuestions || !newExam.passingMarks) {
            toast.warn("Please fill out all required fields.");
            return;
        }
        if (newExam.programming == false && newExam.passingMarks > newExam.numberOfQuestions || newExam.passingMarks < 0) {
            toast.warn("Passing marks should greter than 0 and equal to / less than number of questions.");
            return;
        }

        const saveCallback = async () => {
            try {
                const response = await axios.post(`${API_URL}/exams/CreateWithQuestions`, newExam, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                setExamsData([...examsData, response.data]);
                toast.success("Exam added successfully!");


                toggleModal();
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred.";
                toast.error(errorMessage);
            }
        };

        showToastConfirmation("add", "Exam with random questions", saveCallback);
    };

    // Toggle exam status
    const toggleExamStatus = (id) => {
        const exam = examsData.find((e) => e.id === id);
        const action = exam.active ? "deactivate" : "activate";
        const toggleCallback = async () => {
            try {
                const response = await axios.put(
                    `${API_URL}/exams/status/${id}`,
                    { isActive: !exam.active },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
                setExamsData((prev) =>
                    prev.map((e) => (e.id === id ? { ...e, active: response.data.active } : e))
                );
                toast.success(`Exam ${response.data.active ? "activated" : "deactivated"} successfully!`);
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred.";
                toast.error(errorMessage);
            }
        };

        showToastConfirmation(
            action,
            `exam "${exam.title}"`,
            toggleCallback
        );
    };

    // Manage exam questions
    const manageExamQuestion = async (e, id) => {
        const { checked } = e.target;

        if (checked) {
            if (examQuestionData.length === selectedExam.numberOfQuestions) {
                toast.error(`Exam is limited to ${selectedExam.numberOfQuestions} questions.`);
                return;
            }

            // Add question to selection optimistically
            setExamQuestionData((prev) => [...prev, id]);
        } else {
            // Remove question from selection optimistically
            setExamQuestionData((prev) => prev.filter((questionId) => questionId !== id));
        }

        try {
            if (checked) {
                await axios.post(
                    `${API_URL}/exam_questions`,
                    { exam: { id: selectedExam.id }, question: { id } },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                await axios.delete(`${API_URL}/exam_questions`, {
                    data: { exam: { id: selectedExam.id }, question: { id } },
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred.";
            toast.error(errorMessage);

            // Revert selection on error
            if (checked) {
                setExamQuestionData((prev) => prev.filter((questionId) => questionId !== id)); // Remove from selection
            } else {
                setExamQuestionData((prev) => [...prev, id]); // Add back to selection
            }
        }
    };

    // Delete exam
    const deleteExam = (id) => {
        const deleteCallback = async () => {
            try {
                await axios.delete(`${API_URL}/exams/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                setExamsData((prev) => prev.filter((exam) => exam.id !== id));
                toast.success("Exam deleted successfully!");
            } catch (error) {
                toast.error("Error deleting exam. Please try again.");
            }
        };

        showToastConfirmation("delete", "Exam", deleteCallback, "All results of this exam will be deleted.");
    };

    // Open Edit Form
    const openEditForm = (exam) => {
        setSelectedExam(exam);
        setIsEditing(true);
        setNewExam({
            id: exam.id,
            title: exam.title,
            difficulty: exam.difficulty,
            durationMinutes: exam.durationMinutes,
            numberOfQuestions: exam.numberOfQuestions,
            passingMarks: exam.passingMarks,
            programming: exam.programming,
            active: exam.active,
        });
        toggleModal();
    };

    // Filtered exams based on search text
    const filteredData = Array.isArray(examsData) ? examsData.filter((exam) =>
        exam.title.toLowerCase().includes(searchText.toLowerCase()) ||
        exam.difficulty?.name.toLowerCase().includes(searchText.toLowerCase())
    ).sort((a, b) => b.id - a.id) : [];

    const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
    const toggleExportDropdown = () => setExportDropdownOpen(prev => !prev);

    const exportToCSV = () => {
        try {
            // Convert objects to readable strings
            const formattedData = examsData.map((row) => ({
                ...row,
                difficulty: typeof row.difficulty === "object" && row.difficulty.name ? row.difficulty.name : row.difficulty
            }));

            const csv = Papa.unparse(formattedData); // Convert JSON to CSV format
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "ExamData.csv";
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
            const worksheet = XLSX.utils.json_to_sheet(examsData.map(exam => ({
                ID: exam.id,
                Title: exam.title,
                Difficulty: exam.difficulty?.name || "N/A",
                Duration: exam.durationMinutes,
                Questions: exam.numberOfQuestions,
                "Passing Marks": exam.passingMarks,
                Type: exam.programming ? "Programming" : "MCQ",
                Status: exam.active ? "Active" : "Inactive"
            })));

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Exams");
            XLSX.writeFile(workbook, "exams.xlsx");
            toast.success("Excel file downloaded successfully!");
        } catch (error) {
            toast.error("Error exporting Excel file!");
        }
    };

    const exportToPDF = () => {
        try {
            const doc = new jsPDF();
            doc.text("Exams List", 20, 20);
            let yPos = 30;
            examsData.forEach(exam => {
                doc.text(`ID: ${exam.id}`, 20, yPos);
                doc.text(`Title: ${exam.title}`, 20, yPos + 10);
                doc.text(`Difficulty: ${exam.difficulty?.name || "N/A"}`, 20, yPos + 20);
                doc.text(`Duration: ${exam.durationMinutes} mins`, 20, yPos + 30);
                doc.text(`Questions: ${exam.numberOfQuestions}`, 20, yPos + 40);
                doc.text(`Passing Marks: ${exam.passingMarks}`, 20, yPos + 50);
                doc.text(`Type: ${exam.programming ? "Programming" : "MCQ"}`, 20, yPos + 60);
                doc.text(`Status: ${exam.active ? "Active" : "Inactive"}`, 20, yPos + 70);
                yPos += 80;
                if (yPos > 280) {
                    doc.addPage();
                    yPos = 20;
                }
            });
            doc.save("exams.pdf");
            toast.success("PDF file downloaded successfully!");
        } catch (error) {
            toast.error("Error exporting PDF!");
        }
    };

    // Columns for DataGrid
    const columns = [
        { field: "id", headerName: "ID", width: 100 },
        { field: "title", headerName: "Title", flex: 1 },
        {
            field: "difficulty",
            headerName: "Difficulty",
            flex: 1,
            renderCell: (params) => <div>{params.row.difficulty?.name || "N/A"}</div>,
        },
        { field: "durationMinutes", headerName: "Duration (mins)", flex: 1 },
        { field: "numberOfQuestions", headerName: "Number of Questions", flex: 1 },
        { field: "passingMarks", headerName: "Passing Marks", flex: 1 },
        {
            field: "programming",
            headerName: "Type",
            flex: 1,
            renderCell: (params) => (
                <div>{params.row.programming ? "Programming" : "MCQ"}</div>
            ),
        },
        {
            field: "isActive",
            headerName: "Status",
            flex: 1,
            renderCell: (params) => (
                <button
                    className={`btn btn-${params.row.active ? "secondary" : "success"} btn-sm mr-2`}
                    onClick={() => toggleExamStatus(params.row.id)}
                >
                    {params.row.active ? "Deactivate" : "Activate"}
                </button>
            ),
        },
        {
            field: "actions",
            headerName: "Actions",
            flex: 2,
            renderCell: (params) => (
                <div>
                    <button
                        className="btn btn-sm mr-2"
                        style={{ backgroundColor: "#ecaa44" }}
                        onClick={() => toggleQuestionModal(true, params.row)}
                    >
                        Add/Remove Question
                    </button>
                    <button
                        className="btn btn-primary btn-sm mr-2"
                        onClick={() => openEditForm(params.row)}
                    >
                        Edit
                    </button>
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteExam(params.row.id)}
                    >
                        Delete
                    </button>
                </div>
            ),
        },
    ];

    // Filtered question data
    const filteredQuestionData = questionData
        .map((question) => ({
            ...question,
            select: examQuestionData.includes(question.id) ? 1 : 0,
        }))
        .filter((question) =>
            question.question?.toLowerCase().includes(searchQuestionText.toLowerCase()) ||
            question.difficulty?.name?.toLowerCase().includes(searchQuestionText.toLowerCase()) ||
            question.category?.name?.toLowerCase().includes(searchQuestionText.toLowerCase()) ||
            question.optionA?.toLowerCase().includes(searchQuestionText.toLowerCase()) ||
            question.optionB?.toLowerCase().includes(searchQuestionText.toLowerCase()) ||
            question.optionC?.toLowerCase().includes(searchQuestionText.toLowerCase()) ||
            question.optionD?.toLowerCase().includes(searchQuestionText.toLowerCase())
        )
        .sort((a, b) => {
            if (b.select !== a.select) return b.select - a.select;
            return a.id - b.id;
        });

    // Columns for Question DataGrid
    const QuestionColumns = [
        {
            field: "select",
            headerName: "Select",
            width: 50,
            renderCell: (params) => (
                <input
                    type="checkbox"
                    checked={examQuestionData.includes(params.row.id)}
                    onChange={(e) => manageExamQuestion(e, params.row.id)}
                />
            ),
        },
        { field: "id", headerName: "ID", width: 50 },
        { field: "question", headerName: "Question", flex: 1 },
        {
            field: "image",
            headerName: "Question Image",
            flex: 1,
            renderCell: (params) => (
                params.value ? <img src={`${API_URL}/${params.value}`} alt="Question" style={{ maxWidth: "50px", maxHeight: "50px" }} /> : "N/A"
            ),
        },
    ];

    if (!programming) {
        QuestionColumns.push(
            {
                field: "optionA",
                headerName: "Option A",
                flex: 1,
                renderCell: (params) => (
                    params.row.aimage ? <img src={`${API_URL}/${params.value}`} alt="Option A" style={{ maxWidth: "50px", maxHeight: "50px" }} /> : params.value || "N/A"
                ),
            },
            {
                field: "optionB",
                headerName: "Option B",
                flex: 1,
                renderCell: (params) => (
                    params.row.bimage ? <img src={`${API_URL}/${params.value}`} alt="Option B" style={{ maxWidth: "50px", maxHeight: "50px" }} /> : params.value || "N/A"
                ),
            },
            {
                field: "optionC",
                headerName: "Option C",
                flex: 1,
                renderCell: (params) => (
                    params.row.cimage ? <img src={`${API_URL}/${params.value}`} alt="Option C" style={{ maxWidth: "50px", maxHeight: "50px" }} /> : params.value || "N/A"
                ),
            },
            {
                field: "optionD",
                headerName: "Option D",
                flex: 1,
                renderCell: (params) => (
                    params.row.dimage ? <img src={`${API_URL}/${params.value}`} alt="Option D" style={{ maxWidth: "50px", maxHeight: "50px" }} /> : params.value || "N/A"
                ),
            }
        );
    }
    QuestionColumns.push(
        {
            field: "correctAnswer",
            headerName: "Correct Answer",
            flex: 1,
            renderCell: (params) => (
                <div
                    style={{ overflow: "hidden", textOverflow: "ellipsis" }}
                    dangerouslySetInnerHTML={{ __html: params.value }}
                />
            ),
        },
        {
            field: "difficulty",
            headerName: "Difficulty",
            flex: 1,
            renderCell: (params) => params.value?.name || "N/A",
        },
        {
            field: "category",
            headerName: "Category",
            flex: 1,
            renderCell: (params) => params.value?.name || "N/A",
        },
    );

    return (
        <div>
            <ToastContainer />
            <h1 className="text-center mb-4">Manage Exams</h1>

            {/* Search Input */}
            <div className="d-flex justify-content-between mb-4">
                <input
                    type="text"
                    placeholder="Search Exams By Title Or Difficulty Level"
                    className="form-control"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
                <button className="btn btn-primary ml-4" onClick={() => toggleModal(true)}>
                    Add Exam
                </button>
                <Dropdown
                    isOpen={exportDropdownOpen}
                    toggle={toggleExportDropdown}
                    className="ml-4"
                >
                    <DropdownToggle className="btn btn-success" style={{ height: "63px" }}>
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
            {/* DataGrid */}
            <div style={{ width: "100%" }}>
                <DataGrid
                    rows={filteredData}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[5, 10, 15]}
                    // initialState={{
                    //     sorting: {
                    //         sortModel: [{ field: "id", sort: "asc" }], // Initial sorting by ID ascending
                    //     },
                    // }}
                />
            </div>

            {/* Modal */}
            <Modal isOpen={isModalOpen} toggle={toggleModal}>
                <div className="modal-content">
                    <div className="modal-header">{isEditing ? "Edit Exam" : "Add Exam"}</div>
                    <div className="modal-body">
                        <form>
                            <div className="form-group">
                                <label>Title: *</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.title ? "is-invalid" : ""}`}
                                    name="title"
                                    value={newExam.title}
                                    onChange={handleInputChange}
                                />
                                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                            </div>

                            <div className="form-group">
                                <label>Difficulty: *</label>
                                <select
                                    className={`form-control ${errors.difficulty ? "is-invalid" : ""}`}
                                    name="difficulty"
                                    value={newExam.difficulty.id}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Difficulty</option>
                                    {difficultiesData.map((difficulty) => (
                                        <option key={difficulty.id} value={difficulty.id}>
                                            {difficulty.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.difficulty && <div className="invalid-feedback">{errors.difficulty}</div>}
                            </div>
                            <div className="form-group">
                                <label>Duration (minutes): *</label>
                                <input
                                    type="number"
                                    className={`form-control ${errors.durationMinutes ? "is-invalid" : ""}`}
                                    name="durationMinutes"
                                    value={newExam.durationMinutes}
                                    onChange={handleInputChange}
                                />
                                {errors.durationMinutes && <div className="invalid-feedback">{errors.durationMinutes}</div>}
                            </div>
                            <div className="form-group">
                                <label>Number of questions: *</label>
                                <input
                                    type="number"
                                    className={`form-control ${errors.numberOfQuestions ? "is-invalid" : ""}`}
                                    name="numberOfQuestions"
                                    value={newExam.numberOfQuestions}
                                    onChange={handleInputChange}
                                />
                                {errors.numberOfQuestions && <div className="invalid-feedback">{errors.numberOfQuestions}</div>}
                            </div>
                            <div className="form-group">
                                <label>Is programming exam?</label>
                                <input
                                    type="checkbox"
                                    name="programming"
                                    checked={newExam.programming}
                                    onChange={handleInputChange}
                                    className="mr-2"
                                />
                            </div>
                            <div className="form-group">
                                <label>Passing Marks: *</label>
                                <input
                                    type="number"
                                    className={`form-control ${errors.passingMarks ? "is-invalid" : ""}`}
                                    name="passingMarks"
                                    value={newExam.passingMarks}
                                    onChange={handleInputChange}
                                />
                                {errors.passingMarks && <div className="invalid-feedback">{errors.passingMarks}</div>}
                            </div>
                        </form>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={toggleModal}>
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={saveExam}>
                            {isEditing ? "Edit" : "Add"}
                        </button>
                        {!isEditing ?
                            <button className="btn btn-primary" onClick={saveExamWithQuestion}>
                                Add with random questions
                            </button> : <></>
                        }
                    </div>
                </div>
            </Modal>

            {/* Question Modal */}
            <Modal isOpen={isQuestionModalOpen} toggle={toggleQuestionModal} className="modal-lg">
                <div className="modal-content">
                    <div className="modal-header">Add/Remove Question</div>
                    <div className="modal-body">
                        <div className="d-flex justify-content-between mb-4">
                            <input
                                type="text"
                                placeholder="Search Questions"
                                className="form-control"
                                value={searchQuestionText}
                                onChange={(e) => setQuestionSearchText(e.target.value)}
                            />
                        </div>
                        <div style={{ width: "100%" }}>
                            <DataGrid
                                rows={filteredQuestionData}
                                columns={QuestionColumns}
                                pageSize={10}
                                rowsPerPageOptions={[5, 10, 15]}
                                getRowHeight={(params) => {
                                    const text = params.value || "";
                                    const lineHeight = 20;
                                    const numLines = Math.ceil(text.length / 50);
                                    return Math.max(50, lineHeight * numLines);
                                }}
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={toggleQuestionModal}>
                            Cancel
                        </button>

                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Exams;
