import json

pages = []

# Dashboard C - Action Oriented
pages.append({
    "name": "Dashboard Option C - Action",
    "shapes": [
        ("rect", "Sidebar", 0, -76, 200, 676, "#12121a", "#12121a", [0,0,0,0]),
        ("text", "Logo", 20, -40, "FFE Social Engine", 18, "#ffffff"),
        ("rect", "Nav1BG", 10, 15, 180, 32, "#1e293b", "#1e293b", [4,4,4,4]),
        ("text", "Nav1", 20, 20, "Dashboard", 16, "#ffffff"),
        ("text", "Nav2", 20, 60, "Create Content", 16, "#94a3b8"),
        ("text", "Nav3", 20, 100, "Analytics", 16, "#94a3b8"),
        ("text", "Nav4", 20, 140, "Templates", 16, "#94a3b8"),
        ("rect", "Nav4Badge", 140, 138, 40, 20, "#7c3aed", "#7c3aed", [4,4,4,4]),
        ("text", "Nav4BadgeTxt", 148, 140, "PRO", 12, "#ffffff"),
        ("text", "Nav5", 20, 180, "Settings", 16, "#94a3b8"),
        
        ("text", "Welcome", 240, -40, "Good morning, Firefly Team!", 24, "#0f172a"),
        ("text", "SubWelcome", 240, -10, "What would you like to create today?", 16, "#64748b"),
        
        ("rect", "BigCTA", 240, 30, 520, 140, "#f3e8ff", "#c4b5fd", [12,12,12,12]),
        ("text", "CTATitle", 280, 60, "Start a New Campaign", 24, "#4c1d95"),
        ("text", "CTASub", 280, 90, "Use our AI wizard to generate cross-platform posts in minutes.", 16, "#5b21b6"),
        ("rect", "CTABtn", 580, 70, 140, 48, "#7c3aed", "#7c3aed", [8,8,8,8]),
        ("text", "CTABtnTxt", 605, 85, "Create Now", 16, "#ffffff"),

        ("text", "QuickTitle", 240, 200, "Quick Start Templates", 18, "#0f172a"),
        ("rect", "Tpl1", 240, 230, 160, 120, "#ffffff", "#cbd5e1", [8,8,8,8]),
        ("rect", "Tpl1Img", 240, 230, 160, 80, "#e2e8f0", "#e2e8f0", [8,8,0,0]),
        ("text", "Tpl1Txt", 250, 320, "Product Launch", 14, "#0f172a"),
        
        ("rect", "Tpl2", 420, 230, 160, 120, "#ffffff", "#cbd5e1", [8,8,8,8]),
        ("rect", "Tpl2Img", 420, 230, 160, 80, "#e2e8f0", "#e2e8f0", [8,8,0,0]),
        ("text", "Tpl2Txt", 430, 320, "Event Promo", 14, "#0f172a"),

        ("rect", "Tpl3", 600, 230, 160, 120, "#ffffff", "#cbd5e1", [8,8,8,8]),
        ("rect", "Tpl3Img", 600, 230, 160, 80, "#e2e8f0", "#e2e8f0", [8,8,0,0]),
        ("text", "Tpl3Txt", 610, 320, "Customer Quote", 14, "#0f172a"),

        ("text", "TimelineTitle", 240, 380, "Recent Activity", 18, "#0f172a"),
        ("rect", "Act1", 240, 410, 520, 60, "#ffffff", "#cbd5e1", [8,8,8,8]),
        ("text", "Act1T", 260, 430, "Published 'Summer Promo' to Twitter", 14, "#0f172a"),
        ("text", "Act1D", 650, 430, "2 hours ago", 12, "#64748b"),
        ("rect", "Act2", 240, 480, 520, 60, "#ffffff", "#cbd5e1", [8,8,8,8]),
        ("text", "Act2T", 260, 500, "Draft saved: 'CEO Interview'", 14, "#0f172a"),
        ("text", "Act2D", 650, 500, "Yesterday", 12, "#64748b"),
    ]
})

# Dashboard B - Analytics
pages.append({
    "name": "Dashboard Option B - Analytics",
    "shapes": [
        ("rect", "Sidebar", 0, -76, 200, 676, "#12121a", "#12121a", [0,0,0,0]),
        ("text", "Logo", 20, -40, "FFE Social Engine", 18, "#ffffff"),
        ("text", "Nav1", 20, 20, "Dashboard", 16, "#94a3b8"),
        ("text", "Nav2", 20, 60, "Create Content", 16, "#94a3b8"),
        ("rect", "Nav3BG", 10, 95, 180, 32, "#1e293b", "#1e293b", [4,4,4,4]),
        ("text", "Nav3", 20, 100, "Analytics", 16, "#ffffff"),
        ("text", "Nav4", 20, 140, "Templates", 16, "#94a3b8"),
        ("rect", "Nav4Badge", 140, 138, 40, 20, "#7c3aed", "#7c3aed", [4,4,4,4]),
        ("text", "Nav4BadgeTxt", 148, 140, "PRO", 12, "#ffffff"),
        ("text", "Nav5", 20, 180, "Settings", 16, "#94a3b8"),
        ("text", "Header", 240, -40, "Analytics Overview", 24, "#0f172a"),
        ("rect", "DateFilter", 640, -45, 120, 36, "#ffffff", "#cbd5e1", [6,6,6,6]),
        ("text", "DateTxt", 650, -35, "Last 30 Days", 14, "#0f172a"),
        ("rect", "ChartBox", 240, 20, 520, 200, "#ffffff", "#cbd5e1", [8,8,8,8]),
        ("text", "ChartTitle", 260, 40, "Audience Growth", 16, "#0f172a"),
        ("line", "LineX", 300, 180, 700, 180, "#cbd5e1"),
        ("line", "LineY", 300, 60, 300, 180, "#cbd5e1"),
        ("line", "DataLine1", 300, 150, 400, 120, "#7c3aed"),
        ("line", "DataLine2", 400, 120, 500, 80, "#7c3aed"),
        ("line", "DataLine3", 500, 80, 600, 100, "#7c3aed"),
        ("line", "DataLine4", 600, 100, 700, 60, "#7c3aed"),
        ("rect", "Stat1", 240, 240, 160, 100, "#ffffff", "#cbd5e1", [8,8,8,8]),
        ("text", "Stat1Val", 260, 260, "45.2k", 32, "#0f172a"),
        ("text", "Stat1Lbl", 260, 300, "Followers", 14, "#64748b"),
        ("rect", "Stat2", 420, 240, 160, 100, "#ffffff", "#cbd5e1", [8,8,8,8]),
        ("text", "Stat2Val", 440, 260, "1.2M", 32, "#0f172a"),
        ("text", "Stat2Lbl", 440, 300, "Impressions", 14, "#64748b"),
        ("rect", "Stat3", 600, 240, 160, 100, "#ffffff", "#cbd5e1", [8,8,8,8]),
        ("text", "Stat3Val", 620, 260, "8.4%", 32, "#0f172a"),
        ("text", "Stat3Lbl", 620, 300, "Engagement", 14, "#64748b"),
        ("rect", "TopPosts", 240, 360, 520, 160, "#ffffff", "#cbd5e1", [8,8,8,8]),
        ("text", "TopPostsTitle", 260, 380, "Top Performing Content", 16, "#0f172a"),
        ("rect", "Post1Img", 260, 410, 40, 40, "#e2e8f0", "#e2e8f0", [4,4,4,4]),
        ("text", "Post1Txt", 310, 420, "Q3 Product Reveal Video", 14, "#0f172a"),
        ("text", "Post1Stats", 650, 420, "12k views", 14, "#64748b"),
        ("rect", "Post2Img", 260, 460, 40, 40, "#e2e8f0", "#e2e8f0", [4,4,4,4]),
        ("text", "Post2Txt", 310, 470, "Customer Success Story", 14, "#0f172a"),
        ("text", "Post2Stats", 650, 470, "8.5k views", 14, "#64748b"),
    ]
})

# Onboarding A
pages.append({
    "name": "Onboarding Option A - Single Page",
    "shapes": [
        ("rect", "BG", 0, -76, 800, 676, "#f8fafc", "#f8fafc", [0,0,0,0]),
        ("text", "Title", 300, -40, "Welcome to Social Engine", 24, "#0f172a"),
        ("text", "Sub", 260, -10, "Complete your profile to get started", 16, "#64748b"),
        
        ("rect", "Card1", 200, 40, 400, 120, "#ffffff", "#cbd5e1", [8,8,8,8]),
        ("rect", "C1Circle", 220, 60, 24, 24, "#7c3aed", "#7c3aed", [12,12,12,12]),
        ("text", "C1Num", 228, 62, "1", 14, "#ffffff"),
        ("text", "C1T", 260, 60, "Connect Accounts", 18, "#0f172a"),
        ("rect", "BtnX", 260, 100, 120, 36, "#f1f5f9", "#cbd5e1", [6,6,6,6]),
        ("text", "BtnXT", 280, 110, "Connect Twitter", 14, "#0f172a"),

        ("rect", "Card2", 200, 180, 400, 120, "#ffffff", "#cbd5e1", [8,8,8,8]),
        ("rect", "C2Circle", 220, 200, 24, 24, "#e2e8f0", "#e2e8f0", [12,12,12,12]),
        ("text", "C2Num", 228, 202, "2", 14, "#64748b"),
        ("text", "C2T", 260, 200, "Brand Identity", 18, "#0f172a"),
        ("rect", "Inp1", 260, 240, 200, 36, "#ffffff", "#cbd5e1", [6,6,6,6]),
        ("text", "Inp1T", 270, 250, "Brand Name", 14, "#94a3b8"),

        ("rect", "Card3", 200, 320, 400, 120, "#ffffff", "#cbd5e1", [8,8,8,8]),
        ("rect", "C3Circle", 220, 340, 24, 24, "#e2e8f0", "#e2e8f0", [12,12,12,12]),
        ("text", "C3Num", 228, 342, "3", 14, "#64748b"),
        ("text", "C3T", 260, 340, "Content Preferences", 18, "#0f172a"),
        ("rect", "Inp2", 260, 380, 100, 36, "#f1f5f9", "#cbd5e1", [18,18,18,18]),
        ("text", "Inp2T", 280, 390, "Professional", 14, "#0f172a"),

        ("rect", "Submit", 300, 480, 200, 48, "#7c3aed", "#7c3aed", [8,8,8,8]),
        ("text", "SubmitT", 335, 495, "Complete Setup", 16, "#ffffff"),
    ]
})

# Onboarding B
pages.append({
    "name": "Onboarding Option B - Wizard",
    "shapes": [
        ("rect", "BG", 0, -76, 800, 676, "#ffffff", "#ffffff", [0,0,0,0]),
        ("rect", "ProgBG", 200, -20, 400, 8, "#e2e8f0", "#e2e8f0", [4,4,4,4]),
        ("rect", "ProgFill", 200, -20, 133, 8, "#7c3aed", "#7c3aed", [4,4,4,4]),
        ("text", "StepT", 360, 10, "Step 1 of 3", 14, "#64748b"),
        
        ("text", "Title", 280, 50, "Connect Your Accounts", 24, "#0f172a"),
        ("text", "Sub", 220, 90, "Link your social media profiles so we can publish content for you.", 16, "#64748b"),

        ("rect", "Acc1", 200, 150, 400, 60, "#ffffff", "#cbd5e1", [8,8,8,8]),
        ("rect", "A1I", 220, 165, 30, 30, "#000000", "#000000", [4,4,4,4]),
        ("text", "A1T", 270, 170, "X (Twitter)", 16, "#0f172a"),
        ("rect", "A1Btn", 500, 165, 80, 30, "#000000", "#000000", [4,4,4,4]),
        ("text", "A1BtnT", 515, 172, "Connect", 12, "#ffffff"),

        ("rect", "Acc2", 200, 230, 400, 60, "#ffffff", "#cbd5e1", [8,8,8,8]),
        ("rect", "A2I", 220, 245, 30, 30, "#0a66c2", "#0a66c2", [4,4,4,4]),
        ("text", "A2T", 270, 250, "LinkedIn", 16, "#0f172a"),
        ("rect", "A2Btn", 500, 245, 80, 30, "#0a66c2", "#0a66c2", [4,4,4,4]),
        ("text", "A2BtnT", 515, 252, "Connect", 12, "#ffffff"),

        ("rect", "Acc3", 200, 310, 400, 60, "#ffffff", "#cbd5e1", [8,8,8,8]),
        ("rect", "A3I", 220, 325, 30, 30, "#E1306C", "#E1306C", [4,4,4,4]),
        ("text", "A3T", 270, 330, "Instagram", 16, "#0f172a"),
        ("rect", "A3Btn", 500, 325, 80, 30, "#E1306C", "#E1306C", [4,4,4,4]),
        ("text", "A3BtnT", 515, 332, "Connect", 12, "#ffffff"),

        ("rect", "BtnSkip", 200, 420, 100, 48, "#ffffff", "#cbd5e1", [8,8,8,8]),
        ("text", "BtnSkipT", 230, 435, "Skip", 16, "#64748b"),
        ("rect", "BtnNext", 480, 420, 120, 48, "#7c3aed", "#7c3aed", [8,8,8,8]),
        ("text", "BtnNextT", 515, 435, "Next", 16, "#ffffff"),
    ]
})

# Onboarding C
pages.append({
    "name": "Onboarding Option C - Interactive",
    "shapes": [
        # Background Dashboard
        ("rect", "Sidebar", 0, -76, 200, 676, "#12121a", "#12121a", [0,0,0,0]),
        ("text", "Logo", 20, -40, "FFE Social Engine", 18, "#ffffff"),
        ("text", "Nav1", 20, 20, "Dashboard", 16, "#ffffff"),
        ("rect", "NewBtn", 660, -45, 100, 36, "#7c3aed", "#7c3aed", [6,6,6,6]),
        ("text", "NewBtnT", 675, -35, "New Post", 14, "#ffffff"),
        ("rect", "DashCard", 240, 20, 520, 120, "#ffffff", "#cbd5e1", [8,8,8,8]),

        # Overlay Overlay
        ("rect", "Overlay", 0, -76, 800, 676, "#00000080", "#00000080", [0,0,0,0]),
        
        # Popover Tooltip
        ("rect", "Tip", 420, -10, 300, 140, "#ffffff", "#ffffff", [12,12,12,12]),
        ("text", "TipT1", 440, 10, "Create your first post!", 18, "#0f172a"),
        ("text", "TipT2", 440, 40, "Click here to open the magic AI wizard and generate your first batch of content.", 14, "#64748b"),
        ("rect", "TipBtn", 440, 90, 100, 36, "#7c3aed", "#7c3aed", [6,6,6,6]),
        ("text", "TipBtnT", 460, 100, "Got it", 14, "#ffffff"),
        ("text", "TipStep", 660, 100, "1 / 4", 12, "#94a3b8"),
        
        # Highlight hole (fake it with a box over the button)
        ("rect", "Highlight", 650, -55, 120, 56, "#transparent", "#ffffff", [8,8,8,8]),
    ]
})

# Create Wizard A
pages.append({
    "name": "Create Wizard Option A - Linear Steps",
    "shapes": [
        ("rect", "Header", 0, -76, 800, 60, "#ffffff", "#cbd5e1", [0,0,0,0]),
        ("text", "HeadT", 20, -55, "Create New Post", 18, "#0f172a"),
        ("rect", "BtnCancel", 700, -60, 80, 32, "#f1f5f9", "#cbd5e1", [6,6,6,6]),
        ("text", "BtnCancelT", 715, -53, "Cancel", 14, "#0f172a"),

        # Steps sidebar
        ("rect", "Side", 0, -16, 240, 616, "#f8fafc", "#cbd5e1", [0,0,0,0]),
        ("text", "S1", 40, 20, "1. Topic & Goal", 16, "#7c3aed"),
        ("text", "S2", 40, 70, "2. Select Platforms", 16, "#94a3b8"),
        ("text", "S3", 40, 120, "3. Generate Assets", 16, "#94a3b8"),
        ("text", "S4", 40, 170, "4. Review & Edit", 16, "#94a3b8"),
        ("text", "S5", 40, 220, "5. Schedule", 16, "#94a3b8"),

        # Main area
        ("text", "Title", 280, 20, "What is the post about?", 24, "#0f172a"),
        ("rect", "InpTop", 280, 70, 480, 120, "#ffffff", "#cbd5e1", [8,8,8,8]),
        ("text", "InpTopT", 290, 80, "e.g. Announcing our new summer sale with 20% off...", 14, "#94a3b8"),

        ("text", "Goal", 280, 220, "Primary Goal", 18, "#0f172a"),
        ("rect", "G1", 280, 260, 140, 40, "#f3e8ff", "#7c3aed", [8,8,8,8]),
        ("text", "G1T", 310, 272, "Engagement", 14, "#7c3aed"),
        ("rect", "G2", 440, 260, 140, 40, "#ffffff", "#cbd5e1", [8,8,8,8]),
        ("text", "G2T", 480, 272, "Sales", 14, "#64748b"),
        ("rect", "G3", 600, 260, 140, 40, "#ffffff", "#cbd5e1", [8,8,8,8]),
        ("text", "G3T", 630, 272, "Awareness", 14, "#64748b"),

        ("rect", "Next", 640, 450, 120, 48, "#7c3aed", "#7c3aed", [8,8,8,8]),
        ("text", "NextT", 675, 465, "Next", 16, "#ffffff"),
    ]
})

# Create Wizard B
pages.append({
    "name": "Create Wizard Option B - All in One",
    "shapes": [
        ("rect", "Header", 0, -76, 800, 60, "#ffffff", "#cbd5e1", [0,0,0,0]),
        ("text", "HeadT", 20, -55, "All-in-One Editor", 18, "#0f172a"),
        ("rect", "BtnPub", 680, -60, 100, 32, "#7c3aed", "#7c3aed", [6,6,6,6]),
        ("text", "BtnPubT", 705, -53, "Publish", 14, "#ffffff"),

        # Left Column - Inputs
        ("rect", "LeftC", 0, -16, 400, 616, "#ffffff", "#cbd5e1", [0,0,0,0]),
        ("text", "L1", 20, 10, "Select Platforms", 14, "#64748b"),
        ("rect", "P1", 20, 35, 30, 30, "#000000", "#000000", [4,4,4,4]),
        ("rect", "P2", 60, 35, 30, 30, "#e2e8f0", "#e2e8f0", [4,4,4,4]),
        
        ("text", "L2", 20, 90, "Caption", 14, "#64748b"),
        ("rect", "Capt", 20, 115, 360, 100, "#ffffff", "#cbd5e1", [8,8,8,8]),
        ("text", "CaptT", 30, 125, "Excited to share our latest update! \n#tech #update", 14, "#0f172a"),
        ("rect", "AI1", 330, 180, 40, 24, "#f3e8ff", "#7c3aed", [4,4,4,4]),
        ("text", "AI1T", 340, 185, "AI", 12, "#7c3aed"),

        ("text", "L3", 20, 240, "Media", 14, "#64748b"),
        ("rect", "Media", 20, 265, 360, 140, "#f8fafc", "#cbd5e1", [8,8,8,8]),
        ("text", "MediaT", 140, 320, "+ Upload Image/Video", 14, "#64748b"),
        ("rect", "AI2", 20, 415, 360, 36, "#7c3aed", "#7c3aed", [8,8,8,8]),
        ("text", "AI2T", 120, 425, "Generate Image with AI", 14, "#ffffff"),

        # Right Column - Preview
        ("rect", "RightC", 400, -16, 400, 616, "#f1f5f9", "#cbd5e1", [0,0,0,0]),
        ("text", "PrevT", 420, 10, "Live Preview", 14, "#64748b"),
        ("rect", "Phone", 460, 40, 280, 500, "#ffffff", "#cbd5e1", [24,24,24,24]),
        ("rect", "PHead", 480, 60, 30, 30, "#e2e8f0", "#e2e8f0", [15,15,15,15]),
        ("text", "PName", 520, 65, "Your Brand", 14, "#0f172a"),
        ("text", "PText", 480, 100, "Excited to share our latest update!", 14, "#0f172a"),
        ("rect", "PMedia", 480, 130, 240, 160, "#e2e8f0", "#e2e8f0", [8,8,8,8]),
    ]
})

# Create Wizard C
pages.append({
    "name": "Create Wizard Option C - Templates",
    "shapes": [
        ("rect", "Header", 0, -76, 800, 60, "#ffffff", "#cbd5e1", [0,0,0,0]),
        ("text", "HeadT", 20, -55, "Template Gallery", 18, "#0f172a"),
        
        ("text", "T1", 40, 20, "What kind of post?", 24, "#0f172a"),
        ("rect", "F1", 40, 60, 80, 32, "#7c3aed", "#7c3aed", [16,16,16,16]),
        ("text", "F1T", 55, 68, "All", 14, "#ffffff"),
        ("rect", "F2", 130, 60, 100, 32, "#f1f5f9", "#cbd5e1", [16,16,16,16]),
        ("text", "F2T", 145, 68, "Product", 14, "#64748b"),
        ("rect", "F3", 240, 60, 100, 32, "#f1f5f9", "#cbd5e1", [16,16,16,16]),
        ("text", "F3T", 255, 68, "Event", 14, "#64748b"),

        ("rect", "C1", 40, 120, 220, 260, "#ffffff", "#cbd5e1", [8,8,8,8]),
        ("rect", "C1Img", 40, 120, 220, 140, "#e2e8f0", "#e2e8f0", [8,8,0,0]),
        ("text", "C1T", 50, 270, "Feature Release", 16, "#0f172a"),
        ("text", "C1S", 50, 290, "3 formats • Image", 12, "#64748b"),
        ("rect", "C1B", 50, 330, 200, 36, "#f3e8ff", "#7c3aed", [6,6,6,6]),
        ("text", "C1BT", 110, 340, "Use Template", 14, "#7c3aed"),

        ("rect", "C2", 280, 120, 220, 260, "#ffffff", "#cbd5e1", [8,8,8,8]),
        ("rect", "C2Img", 280, 120, 220, 140, "#e2e8f0", "#e2e8f0", [8,8,0,0]),
        ("text", "C2T", 290, 270, "Customer Quote", 16, "#0f172a"),
        ("text", "C2S", 290, 290, "2 formats • Image", 12, "#64748b"),
        ("rect", "C2B", 290, 330, 200, 36, "#f1f5f9", "#cbd5e1", [6,6,6,6]),
        ("text", "C2BT", 350, 340, "Use Template", 14, "#0f172a"),

        ("rect", "C3", 520, 120, 220, 260, "#ffffff", "#cbd5e1", [8,8,8,8]),
        ("rect", "C3Img", 520, 120, 220, 140, "#e2e8f0", "#e2e8f0", [8,8,0,0]),
        ("text", "C3T", 530, 270, "Weekly Tip", 16, "#0f172a"),
        ("text", "C3S", 530, 290, "1 format • Text", 12, "#64748b"),
        ("rect", "C3B", 530, 330, 200, 36, "#f1f5f9", "#cbd5e1", [6,6,6,6]),
        ("text", "C3BT", 590, 340, "Use Template", 14, "#0f172a"),
    ]
})

# Settings - Accounts
pages.append({
    "name": "Settings - Accounts Option A",
    "shapes": [
        ("rect", "Sidebar", 0, -76, 200, 676, "#12121a", "#12121a", [0,0,0,0]),
        ("text", "Logo", 20, -40, "FFE Social Engine", 18, "#ffffff"),
        ("text", "Nav1", 20, 20, "Dashboard", 16, "#94a3b8"),
        ("rect", "NavS", 10, 175, 180, 32, "#1e293b", "#1e293b", [4,4,4,4]),
        ("text", "Nav5", 20, 180, "Settings", 16, "#ffffff"),

        ("text", "Header", 240, -40, "Connected Accounts", 24, "#0f172a"),
        ("rect", "Tabs", 240, 10, 520, 40, "#ffffff", "#cbd5e1", [8,8,8,8]),
        ("text", "T1", 260, 20, "Accounts", 14, "#7c3aed"),
        ("line", "T1L", 260, 48, 320, 48, "#7c3aed"),
        ("text", "T2", 360, 20, "Billing", 14, "#64748b"),
        ("text", "T3", 440, 20, "Rules", 14, "#64748b"),

        ("rect", "A1", 240, 80, 240, 140, "#ffffff", "#cbd5e1", [8,8,8,8]),
        ("rect", "A1I", 260, 100, 40, 40, "#000000", "#000000", [8,8,8,8]),
        ("text", "A1T", 320, 105, "X (Twitter)", 16, "#0f172a"),
        ("text", "A1U", 320, 125, "@firefly_events", 12, "#64748b"),
        ("rect", "A1B", 260, 160, 200, 36, "#fee2e2", "#f87171", [6,6,6,6]),
        ("text", "A1BT", 320, 170, "Disconnect", 14, "#991b1b"),

        ("rect", "A2", 500, 80, 240, 140, "#ffffff", "#cbd5e1", [8,8,8,8]),
        ("rect", "A2I", 520, 100, 40, 40, "#0a66c2", "#0a66c2", [8,8,8,8]),
        ("text", "A2T", 580, 105, "LinkedIn", 16, "#0f172a"),
        ("text", "A2U", 580, 125, "Firefly Events", 12, "#64748b"),
        ("rect", "A2B", 520, 160, 200, 36, "#fee2e2", "#f87171", [6,6,6,6]),
        ("text", "A2BT", 580, 170, "Disconnect", 14, "#991b1b"),

        ("rect", "A3", 240, 240, 240, 140, "#ffffff", "#cbd5e1", [8,8,8,8]),
        ("rect", "A3I", 260, 260, 40, 40, "#e2e8f0", "#e2e8f0", [8,8,8,8]),
        ("text", "A3T", 320, 265, "Instagram", 16, "#0f172a"),
        ("text", "A3U", 320, 285, "Not connected", 12, "#64748b"),
        ("rect", "A3B", 260, 320, 200, 36, "#f3e8ff", "#7c3aed", [6,6,6,6]),
        ("text", "A3BT", 330, 330, "Connect", 14, "#7c3aed"),
    ]
})

# Settings - Billing
pages.append({
    "name": "Settings - Billing Option A",
    "shapes": [
        ("rect", "Sidebar", 0, -76, 200, 676, "#12121a", "#12121a", [0,0,0,0]),
        ("text", "Logo", 20, -40, "FFE Social Engine", 18, "#ffffff"),
        ("text", "Nav1", 20, 20, "Dashboard", 16, "#94a3b8"),
        ("rect", "NavS", 10, 175, 180, 32, "#1e293b", "#1e293b", [4,4,4,4]),
        ("text", "Nav5", 20, 180, "Settings", 16, "#ffffff"),

        ("text", "Header", 240, -40, "Billing & Plans", 24, "#0f172a"),
        ("rect", "Tabs", 240, 10, 520, 40, "#ffffff", "#cbd5e1", [8,8,8,8]),
        ("text", "T1", 260, 20, "Accounts", 14, "#64748b"),
        ("text", "T2", 360, 20, "Billing", 14, "#7c3aed"),
        ("line", "T2L", 360, 48, 410, 48, "#7c3aed"),
        ("text", "T3", 440, 20, "Rules", 14, "#64748b"),

        ("rect", "P1", 240, 80, 520, 140, "#ffffff", "#7c3aed", [8,8,8,8]),
        ("rect", "PBadge", 260, 100, 60, 24, "#f3e8ff", "#7c3aed", [4,4,4,4]),
        ("text", "PBT", 270, 105, "Active", 12, "#7c3aed"),
        ("text", "PT", 260, 140, "Pro Plan", 24, "#0f172a"),
        ("text", "PPrice", 260, 175, "$29.99 / month", 16, "#64748b"),
        ("rect", "PB1", 600, 100, 140, 36, "#ffffff", "#cbd5e1", [6,6,6,6]),
        ("text", "PB1T", 630, 110, "Cancel Plan", 14, "#0f172a"),

        ("text", "UseT", 240, 250, "Monthly Usage", 18, "#0f172a"),
        ("rect", "U1", 240, 290, 520, 80, "#ffffff", "#cbd5e1", [8,8,8,8]),
        ("text", "U1T", 260, 310, "AI Generations", 16, "#0f172a"),
        ("text", "U1V", 650, 310, "420 / 500", 14, "#64748b"),
        ("rect", "U1B1", 260, 340, 450, 8, "#e2e8f0", "#e2e8f0", [4,4,4,4]),
        ("rect", "U1B2", 260, 340, 380, 8, "#7c3aed", "#7c3aed", [4,4,4,4]),

        ("rect", "U2", 240, 390, 520, 80, "#ffffff", "#cbd5e1", [8,8,8,8]),
        ("text", "U2T", 260, 410, "Social Accounts", 16, "#0f172a"),
        ("text", "U2V", 650, 410, "3 / 5", 14, "#64748b"),
        ("rect", "U2B1", 260, 440, 450, 8, "#e2e8f0", "#e2e8f0", [4,4,4,4]),
        ("rect", "U2B2", 260, 440, 270, 8, "#7c3aed", "#7c3aed", [4,4,4,4]),
    ]
})

# Settings - Content Rules
pages.append({
    "name": "Settings - Content Rules Option A",
    "shapes": [
        ("rect", "Sidebar", 0, -76, 200, 676, "#12121a", "#12121a", [0,0,0,0]),
        ("text", "Logo", 20, -40, "FFE Social Engine", 18, "#ffffff"),
        ("text", "Nav1", 20, 20, "Dashboard", 16, "#94a3b8"),
        ("rect", "NavS", 10, 175, 180, 32, "#1e293b", "#1e293b", [4,4,4,4]),
        ("text", "Nav5", 20, 180, "Settings", 16, "#ffffff"),

        ("text", "Header", 240, -40, "Content Rules & Automations", 24, "#0f172a"),
        ("rect", "Tabs", 240, 10, 520, 40, "#ffffff", "#cbd5e1", [8,8,8,8]),
        ("text", "T1", 260, 20, "Accounts", 14, "#64748b"),
        ("text", "T2", 360, 20, "Billing", 14, "#64748b"),
        ("text", "T3", 440, 20, "Rules", 14, "#7c3aed"),
        ("line", "T3L", 440, 48, 480, 48, "#7c3aed"),

        ("rect", "NewRule", 620, 65, 140, 36, "#7c3aed", "#7c3aed", [6,6,6,6]),
        ("text", "NewRuleT", 645, 75, "+ Add Rule", 14, "#ffffff"),

        ("rect", "R1", 240, 120, 520, 80, "#ffffff", "#cbd5e1", [8,8,8,8]),
        ("text", "R1T", 260, 140, "Auto-append Hashtags", 16, "#0f172a"),
        ("text", "R1D", 260, 165, "Always add #FFE #EventTech to Twitter posts", 14, "#64748b"),
        ("rect", "R1Toggle", 700, 145, 40, 20, "#22c55e", "#22c55e", [10,10,10,10]),
        ("rect", "R1TogBtn", 720, 147, 16, 16, "#ffffff", "#ffffff", [8,8,8,8]),

        ("rect", "R2", 240, 220, 520, 80, "#ffffff", "#cbd5e1", [8,8,8,8]),
        ("text", "R2T", 260, 240, "Profanity Filter", 16, "#0f172a"),
        ("text", "R2D", 260, 265, "Block posts containing words in the blacklist", 14, "#64748b"),
        ("rect", "R2Toggle", 700, 245, 40, 20, "#22c55e", "#22c55e", [10,10,10,10]),
        ("rect", "R2TogBtn", 720, 247, 16, 16, "#ffffff", "#ffffff", [8,8,8,8]),

        ("rect", "R3", 240, 320, 520, 80, "#ffffff", "#cbd5e1", [8,8,8,8]),
        ("text", "R3T", 260, 340, "Link Shortening", 16, "#0f172a"),
        ("text", "R3D", 260, 365, "Automatically shorten URLs using bit.ly", 14, "#64748b"),
        ("rect", "R3Toggle", 700, 345, 40, 20, "#e2e8f0", "#e2e8f0", [10,10,10,10]),
        ("rect", "R3TogBtn", 702, 347, 16, 16, "#ffffff", "#ffffff", [8,8,8,8]),
    ]
})

with open("wireframes.json", "w") as f:
    json.dump(pages, f, indent=2)

