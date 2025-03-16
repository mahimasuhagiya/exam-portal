import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Modal, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/styles.css";
import API_URL, { getWithExpiry } from "../services/authService";
import Papa from "papaparse";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCsv, faFileExcel, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";

const Result = () => {
    const [searchText, setSearchText] = useState("");
    const [resultData, setResultData] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = getWithExpiry("jwtToken");

    // State for filters
    const [filterModalOpen, setFilterModalOpen] = useState(false); // State for filter modal
    const [appliedFilters, setAppliedFilters] = useState({}); // State for applied filters
    const [collegeOptions, setCollegeOptions] = useState([]); // State for college options

    // Fetch results and college options
    useEffect(() => {
        const fetchResults = async () => {
            if (!token) return;
            try {
                const response = await axios.get(`${API_URL}/result`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                setResultData(response.data || []);

                // Fetch college options
                const collegeResponse = await axios.get(`${API_URL}/colleges`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                setCollegeOptions(collegeResponse.data || []);
            } catch (error) {
                toast.error("Error fetching result data!");
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [token]);

    const columns = [
        { 
            field: "id", 
            headerName: "ID", 
            width: 80,
            sortable: true
        },
        { 
            field: "studentName", 
            headerName: "Student Name", 
            flex: 1,
            sortable: true,
            valueGetter: (params) => params?.row?.user?.name || "N/A",
            renderCell: (params) => params?.row?.user?.name || "N/A"
        },
        { 
            field: "examName", 
            headerName: "Exam", 
            flex: 1,
            sortable: true,
            valueGetter: (params) => params?.row?.exam?.title || "N/A",
            renderCell: (params) => params?.row?.exam?.title || "N/A"
        },
        { 
            field: "status", 
            headerName: "Status", 
            width: 120,
            sortable: true,
            valueGetter: (params) => {
                const total = params?.row?.total ?? 0;
                const passingMarks = params?.row?.exam?.passingMarks ?? 0;
                const isProgramming = params?.row?.exam?.programming ?? false;
                const checkedBy = params?.row?.checkedBy;

                if (total >= passingMarks) return "Pass";
                if (isProgramming && checkedBy !== null) return "Fail";
                if (isProgramming) return "Pending";
                return "Fail";
            },
            renderCell: (params) => {
                const total = params?.row?.total ?? 0;
                const passingMarks = params?.row?.exam?.passingMarks ?? 0;
                const isProgramming = params?.row?.exam?.programming ?? false;
                const checkedBy = params?.row?.checkedBy;

                return (
                    <div>
                        {total >= passingMarks ? "Pass" : 
                        (isProgramming && checkedBy !== null) ? "Fail" :
                        isProgramming ? <strong>Pending</strong> : "Fail"}
                    </div>
                )
            }
        },
        { 
            field: "total", 
            headerName: "Marks", 
            flex: 1,
            sortable: true,
            renderCell: (params) => params?.row?.total || 0
        },
        { 
            field: "numberOfQuestions", 
            headerName: "Questions", 
            flex: 1,
            sortable: true,
            valueGetter: (params) => params?.row?.exam?.numberOfQuestions || 0,
            renderCell: (params) => params?.row?.exam?.numberOfQuestions || "N/A"
        },
        { 
            field: "examType", 
            headerName: "Type", 
            flex: 1,
            sortable: true,
            valueGetter: (params) => params?.row?.exam?.programming ? "Programming" : "MCQ",
            renderCell: (params) => params?.row?.exam?.programming ? "Programming" : "MCQ"
        },
        { 
            field: "passingMarks", 
            headerName: "Passing Marks", 
            flex: 1,
            sortable: true,
            valueGetter: (params) => params?.row?.exam?.passingMarks || 0,
            renderCell: (params) => params?.row?.exam?.passingMarks || "N/A"
        },
        { 
            field: "collegeName", 
            headerName: "College", 
            flex: 1,
            sortable: true,
            valueGetter: (params) => params?.row?.user?.college?.name || "N/A",
            renderCell: (params) => params?.row?.user?.college?.name || "N/A"
        },
        { 
            field: "generatedAt", 
            headerName: "Generated At", 
            flex: 1,
            sortable: true,
            valueGetter: (params) => params?.row?.generatedAt ? new Date(params.row.generatedAt).getTime() : 0,
            renderCell: (params) => params?.row?.generatedAt 
                ? `${new Date(params.row.generatedAt).toLocaleString("en-GB")}`
                : "N/A"
        },
        { 
            field: "checkedBy", 
            headerName: "Checked By", 
            flex: 1,
            sortable: true,
            valueGetter: (params) => 
                params?.row?.exam?.programming 
                    ? (params?.row?.checkedBy?.name || "Pending")
                    : "System",
            renderCell: (params) => 
                (params?.row?.exam?.programming && !params?.row?.checkedBy?.name) 
                    ? <strong>Pending</strong> 
                    : params?.row?.exam?.programming 
                        ? params?.row?.checkedBy?.name 
                        : "System"
        },
        {
            field: "actions",
            headerName: "Actions",
            flex: 1,
            sortable: false,
            renderCell: (params) => (
                <div>
                    <a
                        href={`/examresult/${btoa(String(params?.row?.user?.id))}/${btoa(String(params?.row?.exam?.id))}`}
                        className="btn btn-primary btn-sm mr-2"
                    >
                        Check
                    </a>
                </div>
            ),
        },
    ];

    // Export dropdown state
    const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
    const toggleExportDropdown = () => setExportDropdownOpen(prev => !prev);

    // Export to CSV
    const exportToCSV = () => {
        try {
            const formattedData = resultData.map((row) => ({
                ID: row?.id || "",
                "Student Name": row?.user?.name || "N/A",
                "Exam": row?.exam?.title || "N/A",
                "Status": (row?.total ?? 0) >= (row?.exam?.passingMarks ?? 0) 
                    ? "Pass" 
                    : (row?.exam?.programming && row?.checkedBy !== null) 
                        ? "Fail" 
                        : row?.exam?.programming 
                            ? "Pending" 
                            : "Fail",
                "Marks": row?.total || 0,
                "Number of Questions": row?.exam?.numberOfQuestions || "N/A",
                "Type of Exam": row?.exam?.programming ? "Programming" : "MCQ",
                "Passing Criteria": row?.exam?.passingMarks || "N/A",
                "College Name": row?.user?.college?.name || "N/A",
                "Generated At": row?.generatedAt 
                    ? new Date(row.generatedAt).toLocaleString("en-GB") 
                    : "N/A",
                "Checked By": row?.exam?.programming 
                    ? (row?.checkedBy?.name ? row.checkedBy.name : "Pending") 
                    : "System",
            }));

            const csv = Papa.unparse(formattedData);
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "results.csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("CSV file downloaded successfully!");
        } catch (error) {
            toast.error("Error exporting CSV!");
        }
    };

    // Export to Excel
    const exportToExcel = () => {
        try {
            const worksheet = XLSX.utils.json_to_sheet(resultData.map(result => ({
                ID: result.id,
                "Student Name": result.user?.name || "N/A",
                Exam: result.exam?.title || "N/A",
                Status: result.total >= result.exam?.passingMarks ? "Pass" : 
                        (result.exam?.programming && result.checkedBy !== null) ? "Fail" : 
                        result.exam?.programming ? "Pending" : "Fail",
                Marks: result.total || 0,
                "Number of Questions": result.exam?.numberOfQuestions || "N/A",
                "Type of Exam": result.exam?.programming ? "Programming" : "MCQ",
                "Passing Criteria": result.exam?.passingMarks || "N/A",
                "College Name": result.user?.college?.name || "N/A",
                "Generated At": result.generatedAt ? new Date(result.generatedAt).toLocaleString("en-GB") : "N/A",
                "Checked By": result.exam?.programming ? 
                             (result.checkedBy?.name || "Pending") : 
                             "System"
            })));
            
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Results");
            XLSX.writeFile(workbook, "results.xlsx");
            toast.success("Excel file downloaded successfully!");
        } catch (error) {
            toast.error("Error exporting Excel file!");
        }
    };

    // Export to PDF
    const exportToPDF = () => {
        try {
            const doc = new jsPDF();
            doc.text("Results List", 20, 20);
            
            let yPos = 30;
            resultData.forEach(result => {
                doc.text(`ID: ${result.id}`, 20, yPos);
                doc.text(`Student Name: ${result.user?.name || "N/A"}`, 20, yPos + 10);
                doc.text(`Exam: ${result.exam?.title || "N/A"}`, 20, yPos + 20);
                doc.text(`Status: ${result.total >= result.exam?.passingMarks ? "Pass" : 
                          (result.exam?.programming && result.checkedBy !== null) ? "Fail" : 
                          result.exam?.programming ? "Pending" : "Fail"}`, 20, yPos + 30);
                doc.text(`Marks: ${result.total || 0}`, 20, yPos + 40);
                doc.text(`Questions: ${result.exam?.numberOfQuestions || "N/A"}`, 20, yPos + 50);
                doc.text(`Type: ${result.exam?.programming ? "Programming" : "MCQ"}`, 20, yPos + 60);
                doc.text(`Passing Marks: ${result.exam?.passingMarks || "N/A"}`, 20, yPos + 70);
                doc.text(`College: ${result.user?.college?.name || "N/A"}`, 20, yPos + 80);
                doc.text(`Generated At: ${result.generatedAt ? new Date(result.generatedAt).toLocaleString("en-GB") : "N/A"}`, 20, yPos + 90);
                doc.text(`Checked By: ${result.exam?.programming ? 
                         (result.checkedBy?.name || "Pending") : 
                         "System"}`, 20, yPos + 100);
                yPos += 110;
                
                if (yPos > 280) {
                    doc.addPage();
                    yPos = 20;
                }
            });
            
            doc.save("results.pdf");
            toast.success("PDF file downloaded successfully!");
        } catch (error) {
            toast.error("Error exporting PDF!");
        }
    };

    // Apply filters
    const applyFilters = (filters) => {
        setAppliedFilters(filters);
    };

    // Filter data based on search and applied filters
    const filteredData = resultData
    .filter(result => {
        const searchLower = searchText.toLowerCase();
        const matchesSearch = [
            result?.generatedAt?.toLowerCase(),
            result?.exam?.title?.toLowerCase(),
            result?.exam?.programming ? "programming" : "mcq",
            (result?.total >= result?.exam?.passingMarks ? "pass" : "fail"),
            result?.user?.name?.toLowerCase(),
            result?.user?.email?.toLowerCase(),
            result?.user?.college?.name?.toLowerCase(),
            result?.user?.college?.address?.toLowerCase()
        ].some(value => value?.includes(searchLower));

        // Status Filter Logic
        const matchesStatus = !appliedFilters.status || 
            (appliedFilters.status === "Pass" && result?.total >= result?.exam?.passingMarks) ||
            (appliedFilters.status === "Fail" && result?.total < result?.exam?.passingMarks && 
                (!result?.exam?.programming || result?.checkedBy !== null)) ||
            (appliedFilters.status === "Pending" && result?.exam?.programming && result?.checkedBy === null);

        const matchesCollege = !appliedFilters.college || 
            result?.user?.college?.id === parseInt(appliedFilters.college);

        const matchesType = !appliedFilters.type || 
            (appliedFilters.type === "MCQ" && !result?.exam?.programming) ||
            (appliedFilters.type === "Programming" && result?.exam?.programming);

        return matchesSearch && matchesStatus && matchesCollege && matchesType;
    })
    .sort((a, b) => (b?.id || 0) - (a?.id || 0));

    // Filter Modal Component
    const FilterModal = ({ isOpen, toggle, applyFilters }) => {
        const [filters, setFilters] = useState({
            status: "",
            college: "",
            type: "",
        });

        // Handle input change
        const handleInputChange = (e) => {
            const { name, value } = e.target;
            setFilters((prev) => ({ ...prev, [name]: value }));
        };

        // Apply filters and close the modal
        const handleApplyFilters = () => {
            applyFilters(filters);
            toggle();
        };

        // Reset filters
        const handleResetFilters = () => {
            setFilters({ status: "", college: "", type: "" });
            applyFilters({});
        };

        return (
            <Modal isOpen={isOpen} toggle={toggle}>
                <div className="modal-content">
                    <div className="modal-header">Filter Results</div>
                    <div className="modal-body">
                        <form>
                            {/* Status Filter */}
                            <div className="form-group">
                                <label>Status:</label>
                                <select
                                    className="form-control"
                                    name="status"
                                    value={filters.status}
                                    onChange={handleInputChange}
                                >
                                    <option value="">All</option>
                                    <option value="Pass">Pass</option>
                                    <option value="Fail">Fail</option>
                                    <option value="Pending">Pending</option>
                                </select>
                            </div>

                            {/* College Filter */}
                            <div className="form-group">
                                <label>College:</label>
                                <select
                                    className="form-control"
                                    name="college"
                                    value={filters.college}
                                    onChange={handleInputChange}
                                >
                                    <option value="">All</option>
                                    {collegeOptions.map((college) => (
                                        <option key={college.id} value={college.id}>
                                            {college.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Type Filter */}
                            <div className="form-group">
                                <label>Type:</label>
                                <select
                                    className="form-control"
                                    name="type"
                                    value={filters.type}
                                    onChange={handleInputChange}
                                >
                                    <option value="">All</option>
                                    <option value="MCQ">MCQ</option>
                                    <option value="Programming">Programming</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={handleResetFilters}>
                            Reset
                        </button>
                        <button className="btn btn-secondary" onClick={toggle}>
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={handleApplyFilters}>
                            Apply Filters
                        </button>
                    </div>
                </div>
            </Modal>
        );
    };

    return (
        <div>
            <ToastContainer />
            <h1 className="text-center mb-4">Results</h1>

            <div className="d-flex justify-content-between mb-4">
                <input
                    type="text"
                    placeholder="Search here..."
                    className="form-control"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
                <button 
                    className="btn btn-info ml-4" 
                    onClick={() => setFilterModalOpen(true)}
                >
                    Apply Filters
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

            <div style={{ width: "100%", height: 600 }}>
                <DataGrid
                    loading={loading}
                    rows={filteredData}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[5, 10, 15]}
                    sortingOrder={['asc', 'desc']}
                    disableColumnMenu={false}
                    initialState={{
                        sorting: {
                            sortModel: [
                                { field: 'id', sort: 'desc' },
                                { field: 'generatedAt', sort: 'desc' }
                            ]
                        }
                    }}
                />
            </div>

            {/* Filter Modal */}
            <FilterModal
                isOpen={filterModalOpen}
                toggle={() => setFilterModalOpen(!filterModalOpen)}
                applyFilters={applyFilters}
            />
        </div>
    );
};

export default Result;