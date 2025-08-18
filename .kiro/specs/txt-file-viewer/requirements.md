# Requirements Document

## Introduction

本專案旨在建立一個簡潔的 TXT 檔案檢視器 MVP，讓使用者能夠上傳並瀏覽文字檔案。介面設計參考 ChatGPT 的版面配置，包含左側檔案清單、右側內容顯示區域，以及底部工具列。核心功能包括檔案上傳、內容顯示、檔案切換、全文搜尋等，並支援基本的使用者互動體驗。

## Requirements

### Requirement 1

**User Story:** 作為使用者，我想要上傳 TXT 檔案，以便在網頁上檢視檔案內容

#### Acceptance Criteria

1. WHEN 使用者點擊「+」按鈕 THEN 系統 SHALL 開啟原生檔案選擇器
2. WHEN 檔案選擇器開啟 THEN 系統 SHALL 只接受 .txt 副檔名的檔案
3. WHEN 使用者選擇非 .txt 檔案 THEN 系統 SHALL 顯示「僅支援 .txt」錯誤訊息
4. WHEN 使用者選擇超過 5MB 的檔案 THEN 系統 SHALL 顯示「檔案過大」錯誤訊息
5. WHEN 檔案無法以 UTF-8 編碼讀取 THEN 系統 SHALL 顯示「無法解析文字」錯誤訊息
6. WHEN 檔案上傳成功 THEN 系統 SHALL 將檔名加入左側清單頂部並設為作用中狀態
7. WHEN 檔案上傳成功 THEN 系統 SHALL 在右側內容區立即顯示檔案內容

### Requirement 2

**User Story:** 作為使用者，我想要在左側看到已上傳的檔案清單，以便快速切換不同檔案

#### Acceptance Criteria

1. WHEN 系統載入 THEN 左側邊欄 SHALL 固定寬度為 280px
2. WHEN 檔案清單顯示 THEN 系統 SHALL 以淺灰背景呈現側邊欄
3. WHEN 滑鼠懸停在檔案項目上 THEN 系統 SHALL 顯示明顯的 hover 效果
4. WHEN 檔案為作用中狀態 THEN 系統 SHALL 以醒目樣式標示該檔案
5. WHEN 檔案名稱過長 THEN 系統 SHALL 以中間截斷方式顯示
6. WHEN 使用者點擊側欄任一檔名 THEN 系統 SHALL 切換右側內容為對應檔案
7. WHEN 切換檔案 THEN 系統 SHALL 保存前一個檔案的捲軸位置
8. WHEN 返回已瀏覽過的檔案 THEN 系統 SHALL 還原該檔案的捲軸位置

### Requirement 3

**User Story:** 作為使用者，我想要在右側內容區以易讀的方式檢視檔案內容，以便舒適地閱讀文字

#### Acceptance Criteria

1. WHEN 內容顯示 THEN 右側內容區 SHALL 支援垂直捲動
2. WHEN 內容顯示 THEN 系統 SHALL 以聊天氣泡風格排版內容
3. WHEN 內容顯示 THEN 系統 SHALL 設定最大寬度為 760px
4. WHEN 內容顯示 THEN 系統 SHALL 設定行高為 1.7
5. WHEN 內容包含大段落 THEN 系統 SHALL 自動分段顯示
6. WHEN 內容包含連續空白與換行 THEN 系統 SHALL 保留原始格式
7. WHEN 內容包含長行 THEN 系統 SHALL 自動換行處理
8. WHEN 內容顯示 THEN 系統 SHALL 使用等寬字型
9. WHEN 使用者捲動內容 THEN 系統 SHALL 記錄當前檔案的捲軸位置

### Requirement 4

**User Story:** 作為使用者，我想要在檔案內搜尋特定文字，以便快速找到需要的內容

#### Acceptance Criteria

1. WHEN 底部工具列顯示 THEN 系統 SHALL 固定在頁面底部
2. WHEN 底部工具列顯示 THEN 寬度 SHALL 隨右側內容區調整
3. WHEN 搜尋框顯示 THEN 系統 SHALL 顯示 placeholder「Search in file」
4. WHEN 使用者輸入搜尋關鍵字 THEN 系統 SHALL 在作用中檔案內進行全文搜尋
5. WHEN 執行搜尋 THEN 系統 SHALL 預設不分大小寫
6. WHEN 找到搜尋結果 THEN 系統 SHALL 即時高亮所有命中項目
7. WHEN 有搜尋結果 THEN 系統 SHALL 顯示「當前索引/總命中數」
8. WHEN 使用者按 Enter 或點擊下一個按鈕 THEN 系統 SHALL 跳轉到下一個命中項目
9. WHEN 使用者按 Shift+Enter 或點擊上一個按鈕 THEN 系統 SHALL 跳轉到上一個命中項目
10. WHEN 跳轉到命中項目 THEN 系統 SHALL 使用平滑捲動效果
11. WHEN 跳轉到命中項目 THEN 當前命中項目 SHALL 有明顯的外框標示
12. WHEN 跳轉到命中項目 THEN 系統 SHALL 自動捲動至可視範圍

### Requirement 5

**User Story:** 作為使用者，我想要系統能穩定運行且提供清楚的錯誤提示，以便順暢地使用應用程式

#### Acceptance Criteria

1. WHEN 發生檔案格式錯誤 THEN 系統 SHALL 顯示清楚的錯誤提示且不崩潰
2. WHEN 發生檔案大小超限錯誤 THEN 系統 SHALL 顯示清楚的錯誤提示且不崩潰
3. WHEN 發生檔案編碼錯誤 THEN 系統 SHALL 顯示清楚的錯誤提示且不崩潰
4. WHEN 系統運行 THEN 應用程式 SHALL 為單頁應用程式
5. WHEN 系統運行 THEN 應用程式 SHALL 無需伺服器 API 支援
6. WHEN 大檔案載入 THEN 系統 