import React, { useState, useEffect } from 'react';
import {
  TextField,
  Select,
  MenuItem,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Tooltip
} from '@mui/material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Checkbox from '@mui/material/Checkbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

import * as XLSX from 'xlsx';

interface DeductionItem {
  id: string;
  description: string;
  points: number;
  feedback: string;
}

interface Student {
  id: string;
  studentId: string;
  name: string;
  deductions: string[];
  score: number;
  feedback: string;
}

function App() {
  const [totalPoints, setTotalPoints] = useState(100);
  const [deductionItems, setDeductionItems] = useState<DeductionItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');

  // 学生追加用コンポーネント
  const [openStudentDialog, setOpenStudentDialog] = useState(false);
  const [newStudent, setNewStudent] = useState({
    studentId: '',
    name: ''
  });

  // 減点項目追加用のダイアログの状態
  const [openDeductionDialog, setOpenDeductionDialog] = useState(false);
  const [newDeduction, setNewDeduction] = useState({
    description: '',
    points: 0,
    feedback: ''
  });

  // 学生追加用ダイアログを開く
  const handleOpenStudentDialog = () => {
    setOpenStudentDialog(true);
    setNewStudent({
      studentId: '',
      name: ''
    });
  };

  // 学生追加用ダイアログを閉じる
  const handleCloseStudentDialog = () => {
    setOpenStudentDialog(false);
  };


  // LocalStorageからデータを読む
  useEffect(() => {
    console.log('useEffect');
    const savedDeductions = localStorage.getItem('deductionItems');
    const savedStudents = localStorage.getItem('students');

    if (savedDeductions) {
      setDeductionItems(JSON.parse(savedDeductions));
    }
    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    }
  }, []);

  // 学生を追加する
  const handleAddStudent = () => {
    if (!newStudent.studentId || !newStudent.name) return;

    const newStudentData: Student = {
      id: `student-${Date.now()}`,
      studentId: newStudent.studentId,
      name: newStudent.name,
      deductions: [],
      score: totalPoints,
      feedback: ''
    };
    const newStudents = [...students, newStudentData];
    setStudents(newStudents);
    localStorage.setItem('students', JSON.stringify(newStudents));
    handleCloseStudentDialog();
  };

  // 選択中の学生を削除する
  const handleRemoveStudent = () => {
    if (!selectedStudent) return;
    const newStudents = students.filter(student => student.id !== selectedStudent);
    setStudents(newStudents);
    setSelectedStudent('');
    localStorage.setItem('students', JSON.stringify(newStudents));
  };

  // 減点項目を追加
  const handleAddDeduction = () => {
    if (!newDeduction.description || !newDeduction.points) return;

    const newItem: DeductionItem = {
      id: `deduction-${Date.now()}`,
      description: newDeduction.description,
      points: newDeduction.points,
      feedback: newDeduction.feedback
    };

    const newDeductions = [...deductionItems, newItem];
    setDeductionItems(newDeductions);
    localStorage.setItem('deductionItems', JSON.stringify(newDeductions));
    setOpenDeductionDialog(false);
  };

  // 減点項目のチェック状態を変更
  const handleDeductionToggle = (deductionId: string) => {
    const currentStudent = students.find(s => s.id === selectedStudent);
    if (!currentStudent) return;

    const deduction = deductionItems.find(d => d.id === deductionId);
    if (!deduction) return;

    const newStudents = students.map(student => {
      if (student.id !== selectedStudent) return student;

      const hasDeduction = student.deductions.includes(deductionId);
      let newDeductions: string[];
      let newScore: number;
      let newFeedback: string;

      if (hasDeduction) {
        // チェックを外す場合
        newDeductions = student.deductions.filter(id => id !== deductionId);
      } else {
        // チェックを入れる場合
        newDeductions = [...student.deductions, deductionId];
      }

      // 採点の再計算
      newScore = totalPoints;
      newDeductions.forEach(id => {
        const deduction = deductionItems.find(d => d.id === id);
        if (deduction) {
          newScore -= deduction.points;
        }
      });

      newFeedback = '';
      deductionItems.forEach(deduction => {
        if (newDeductions.includes(deduction.id)) {
          newFeedback += `${deduction.feedback} (-${deduction.points} points)\n`;
        }
      });

      return {
        ...student,
        deductions: newDeductions,
        score: newScore,
        feedback: newFeedback
      };
    });

    setStudents(newStudents);
    localStorage.setItem('students', JSON.stringify(newStudents));
  }

  // Excelファイルを読み込む
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);;
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

      console.log(jsonData);

      // 1行目をスキップしたい場合は slice(1) を追加
      const newStudents = jsonData.map((row) => ({
        id: `student-${Date.now()}-${Math.random()}`,
        studentId: row[0]?.toString() || '',
        name: row[1]?.toString() || '',
        deductions: [],
        score: totalPoints,
        feedback: ''
      }));

      // 既存の学生リストと結合
      const updatedStudents = [...students, ...newStudents];
      setStudents(updatedStudents);
      localStorage.setItem('students', JSON.stringify(updatedStudents));
    };
    reader.readAsArrayBuffer(file);
  }

  return (
    <div className="App">
      <header className="App-header">
        <Typography variant="h4" component="h1" gutterBottom>
          DSA Grading Tool
        </Typography>
      </header>
      <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
        <Box sx={{ mb: 3 }}>
          <TextField
            label="totalPoints"
            type="number"
            value={totalPoints}
            onChange={(e) => setTotalPoints(Number(e.target.value))}
            fullWidth
            variant="outlined"
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel>学生を選択</InputLabel>
            <Select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              label="select-student"
            >
              {students.map((student) => (
                <MenuItem key={student.id} value={student.id}>
                  {student.name} ({student.studentId})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenStudentDialog}
          >
            学生を追加
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleRemoveStudent}
          >
            選択中の学生を削除
          </Button>
          <Tooltip title="名簿とは、1列目に学籍番号、2列目に名前が記載されたテーブルを指します" arrow>
            <Button
              variant="contained"
              component="label"
              color="secondary"
            >
              名簿をインポート(.xlsx, .xls, .csv)
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                hidden
                onChange={handleFileUpload}
              />
            </Button>
          </Tooltip>
        </Box>

        <Typography variant="body2" color="text.secondary">
          学生数: {students.length}
        </Typography>
      </Box>

      {/* 学生追加ダイアログ */}
      <Dialog open={openStudentDialog} onClose={handleCloseStudentDialog}>
        <DialogTitle>学生を追加</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="studentId"
              value={newStudent.studentId}
              onChange={(e) => setNewStudent({
                ...newStudent,
                studentId: e.target.value
              })}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="name"
              value={newStudent.name}
              onChange={(e) => setNewStudent({
                ...newStudent,
                name: e.target.value
              })}
              fullWidth
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStudentDialog}>キャンセル</Button>
          <Button
            onClick={handleAddStudent}
            variant="contained"
            disabled={!newStudent.studentId || !newStudent.name}
          >
            追加
          </Button>
        </DialogActions>
      </Dialog>

      {/* 選択された学生の採点セクション */}
      {selectedStudent && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Current Score: {students.find(s => s.id === selectedStudent)?.score.toFixed(2)} / {totalPoints.toFixed(2)}
          </Typography>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDeductionDialog(true)}
            sx={{ mb: 2 }}
          >
            減点項目を追加
          </Button>

          <List>
            {deductionItems.map((item) => (
              <ListItem key={item.id} dense>
                <Checkbox
                  edge="start"
                  checked={students.find(s => s.id === selectedStudent)?.deductions.includes(item.id) ?? false}
                  onChange={() => handleDeductionToggle(item.id)}
                />
                <ListItemText
                  primary={`${item.description} (-${item.points} points)`}
                />
              </ListItem>
            ))}
          </List>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Feedback(generated):
          </Typography>
          <TextField
            multiline
            rows={4}
            value={students.find(s => s.id === selectedStudent)?.feedback ?? ''}
            fullWidth
            variant="outlined"
            disabled
            sx={{
              "& .MuiInputBase-input.Mui-disabled": {
                WebkitTextFillColor: "rgba(0, 0, 0, 1)"
              }
            }}
          />
        </Box>
      )}

      {/* 減点項目追加ダイアログ */}
      <Dialog open={openDeductionDialog} onClose={() => setOpenDeductionDialog(false)}>
        <DialogTitle>減点項目を追加</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="description"
              value={newDeduction.description}
              onChange={(e) => setNewDeduction({
                ...newDeduction,
                description: e.target.value
              })}
              fullWidth
            />
            <TextField
              label="points"
              type="number"
              value={newDeduction.points}
              onChange={(e) => setNewDeduction({
                ...newDeduction,
                points: Number(e.target.value)
              })}
              fullWidth
            />
            <TextField
              label="feedback"
              multiline
              rows={3}
              value={newDeduction.feedback}
              onChange={(e) => setNewDeduction({
                ...newDeduction,
                feedback: e.target.value
              })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeductionDialog(false)}>キャンセル</Button>
          <Button
            onClick={handleAddDeduction}
            variant="contained"
            disabled={!newDeduction.description || !newDeduction.points || !newDeduction.feedback}
          >
            追加
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default App;
