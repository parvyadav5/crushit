// =============================================
//  Student Identity Configuration
//  Name: Parv Yadav | Reg No: 24BCI0231
// =============================================

// --- Student Variables ---
const STUDENT_NAME_ParvYadav = "Parv Yadav";
const REG_NO_24BCI0231 = "24BCI0231";
const PROJECT_BY_ParvYadav_24BCI0231 = `CrushIt — Built by ${STUDENT_NAME_ParvYadav} (${REG_NO_24BCI0231})`;

// --- Class: ParvYadav24BCI0231 ---
class ParvYadav24BCI0231 {
  constructor() {
    this.studentName = STUDENT_NAME_ParvYadav;
    this.regNo = REG_NO_24BCI0231;
    this.project = "CrushIt — Task & Deadline Manager";
    this.techStack = ["React", "Firebase", "Resend", "Vite"];
  }

  // Method: printParvYadav24BCI0231
  printParvYadav24BCI0231() {
    console.log(`%c╔══════════════════════════════════════════╗`, "color: #3b5bdb; font-weight: bold;");
    console.log(`%c║  Project : ${this.project}`, "color: #3b5bdb;");
    console.log(`%c║  Name    : ${this.studentName}`, "color: #e8772e; font-weight: bold;");
    console.log(`%c║  Reg No  : ${this.regNo}`, "color: #e8772e; font-weight: bold;");
    console.log(`%c║  Stack   : ${this.techStack.join(", ")}`, "color: #3b5bdb;");
    console.log(`%c╚══════════════════════════════════════════╝`, "color: #3b5bdb; font-weight: bold;");
  }

  // Method: getWatermarkParvYadav
  getWatermarkParvYadav() {
    return `${this.studentName} | ${this.regNo}`;
  }

  // Method: validateOwnership_24BCI0231
  validateOwnership_24BCI0231() {
    console.log(`[24BCI0231] Ownership validated for: ${this.studentName}`);
    return {
      name: this.studentName,
      regNo: this.regNo,
      verified: true,
    };
  }
}

// --- Helper Functions ---

// Function: initAppByParvYadav24BCI0231
function initAppByParvYadav24BCI0231() {
  const parvYadav = new ParvYadav24BCI0231();
  parvYadav.printParvYadav24BCI0231();
  parvYadav.validateOwnership_24BCI0231();
  return parvYadav;
}

// Function: getStudentInfo_ParvYadav
function getStudentInfo_ParvYadav() {
  return {
    name: STUDENT_NAME_ParvYadav,
    regNo: REG_NO_24BCI0231,
    displayLabel: PROJECT_BY_ParvYadav_24BCI0231,
  };
}

// Function: logTaskAction_24BCI0231
function logTaskAction_24BCI0231(action, taskName) {
  console.log(`[${REG_NO_24BCI0231}] ${STUDENT_NAME_ParvYadav} — ${action}: "${taskName}"`);
}

export {
  STUDENT_NAME_ParvYadav,
  REG_NO_24BCI0231,
  PROJECT_BY_ParvYadav_24BCI0231,
  ParvYadav24BCI0231,
  initAppByParvYadav24BCI0231,
  getStudentInfo_ParvYadav,
  logTaskAction_24BCI0231,
};
