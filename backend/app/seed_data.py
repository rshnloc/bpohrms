from datetime import datetime, timedelta
import random
from app.database import get_db

def seed_database_if_empty():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM campaigns")
        if cursor.fetchone()[0] > 0:
            return  # Already seeded

        print("Seeding synthetic BPO and HRMS data...")

        # 1. Campaigns (Synthetic client processes)
        campaigns = [
            ("CAMP-101", "Apex Cloud Voice Support", "CLI-SYNTH-APX", "Inbound Voice", 92.0, 320, 4.6, 28, "Synthetic Lead Jordan T.", 1),
            ("CAMP-102", "OmniPay Fraud Detection", "CLI-SYNTH-OPAY", "Blended Tier-2", 96.0, 240, 4.8, 20, "Synthetic Lead Taylor K.", 1),
            ("CAMP-103", "Starlight E-Commerce Care", "CLI-SYNTH-STAR", "Omni-channel Chat", 88.0, 180, 4.3, 35, "Synthetic Lead Casey M.", 1),
            ("CAMP-104", "Vanguard Health Logistics", "CLI-SYNTH-VANG", "Back-Office / Ops", 95.0, 420, 4.7, 18, "Synthetic Lead Morgan R.", 1),
        ]
        cursor.executemany("""
            INSERT INTO campaigns (id, name, client_code, channel_type, target_sla, target_aht_seconds, target_csat, head_count, lead_name, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, campaigns)

        # 2. Employees (Synthetic roles, IDs, mock contacts, no real PII)
        synthetic_employees = [
            ("EMP-1001", "Synthetic Agent 01 (Jordan Chen)", "agent.1001@pulse-bpo.internal", "Senior Agent", "Operations", "CAMP-101", "Morning (06:00-15:00)", "In Call", 22.50, "2023-03-15", "+1-555-0101", "FLR2-BAY-A12"),
            ("EMP-1002", "Synthetic Agent 02 (Alex Rivera)", "agent.1002@pulse-bpo.internal", "Customer Support Agent", "Operations", "CAMP-101", "Morning (06:00-15:00)", "Available", 18.00, "2023-08-20", "+1-555-0102", "FLR2-BAY-A13"),
            ("EMP-1003", "Synthetic Agent 03 (Taylor Reed)", "agent.1003@pulse-bpo.internal", "Customer Support Agent", "Operations", "CAMP-101", "Morning (06:00-15:00)", "Wrap Up", 18.50, "2023-11-10", "+1-555-0103", "FLR2-BAY-A14"),
            ("EMP-1004", "Synthetic Agent 04 (Casey Morales)", "agent.1004@pulse-bpo.internal", "Technical Support Tier-2", "Operations", "CAMP-101", "Day (14:00-23:00)", "In Call", 24.00, "2022-09-01", "+1-555-0104", "FLR2-BAY-B01"),
            ("EMP-1005", "Synthetic Agent 05 (Morgan Vance)", "agent.1005@pulse-bpo.internal", "Customer Support Agent", "Operations", "CAMP-102", "Day (14:00-23:00)", "Break", 19.00, "2024-01-15", "+1-555-0105", "FLR3-BAY-C04"),
            ("EMP-1006", "Synthetic Agent 06 (Riley Brooks)", "agent.1006@pulse-bpo.internal", "Senior Fraud Analyst", "Operations", "CAMP-102", "Night/Graveyard (22:00-07:00)", "Available", 26.00, "2022-04-12", "+1-555-0106", "FLR3-BAY-C05"),
            ("EMP-1007", "Synthetic Agent 07 (Quinn Kelly)", "agent.1007@pulse-bpo.internal", "Fraud Specialist", "Operations", "CAMP-102", "Night/Graveyard (22:00-07:00)", "In Call", 23.00, "2023-05-18", "+1-555-0107", "FLR3-BAY-C06"),
            ("EMP-1008", "Synthetic Agent 08 (Jamie Ortiz)", "agent.1008@pulse-bpo.internal", "Chat Care Associate", "Operations", "CAMP-103", "Morning (06:00-15:00)", "Available", 17.50, "2024-02-01", "+1-555-0108", "FLR1-BAY-D09"),
            ("EMP-1009", "Synthetic Agent 09 (Skyler Patel)", "agent.1009@pulse-bpo.internal", "Chat Care Associate", "Operations", "CAMP-103", "Day (14:00-23:00)", "Training", 17.50, "2024-03-10", "+1-555-0109", "FLR1-BAY-D10"),
            ("EMP-1010", "Synthetic Agent 10 (Dakota Lee)", "agent.1010@pulse-bpo.internal", "Claims Coordinator", "Operations", "CAMP-104", "Morning (06:00-15:00)", "Available", 20.00, "2023-01-22", "+1-555-0110", "FLR4-BAY-E02"),
            ("EMP-1011", "Synthetic Agent 11 (Avery Watson)", "agent.1011@pulse-bpo.internal", "Senior Claims Specialist", "Operations", "CAMP-104", "Day (14:00-23:00)", "In Call", 23.50, "2022-11-05", "+1-555-0111", "FLR4-BAY-E03"),
            ("EMP-1012", "Synthetic Agent 12 (Kendall Ross)", "agent.1012@pulse-bpo.internal", "Customer Support Agent", "Operations", "CAMP-101", "Night/Graveyard (22:00-07:00)", "Offline", 19.50, "2023-07-14", "+1-555-0112", "FLR2-BAY-A15"),
            ("EMP-2001", "Synthetic TL 01 (Jordan Thompson)", "tl.2001@pulse-bpo.internal", "Team Leader", "Operations", "CAMP-101", "Morning (06:00-15:00)", "Available", 29.00, "2021-06-10", "+1-555-0120", "FLR2-LEAD-01"),
            ("EMP-2002", "Synthetic TL 02 (Taylor Knight)", "tl.2002@pulse-bpo.internal", "Team Leader", "Operations", "CAMP-102", "Day (14:00-23:00)", "Available", 29.50, "2021-09-01", "+1-555-0121", "FLR3-LEAD-02"),
            ("EMP-3001", "Synthetic QA 01 (Samira Hayes)", "qa.3001@pulse-bpo.internal", "Quality Assurance Specialist", "Quality", "CAMP-101", "Morning (06:00-15:00)", "Available", 27.00, "2022-02-14", "+1-555-0130", "FLR2-QA-01"),
            ("EMP-3002", "Synthetic QA 02 (Robin Diaz)", "qa.3002@pulse-bpo.internal", "Quality Assurance Lead", "Quality", "CAMP-102", "Day (14:00-23:00)", "Available", 31.00, "2021-03-20", "+1-555-0131", "FLR3-QA-02"),
            ("EMP-4001", "Synthetic WFM 01 (Marcus Foster)", "wfm.4001@pulse-bpo.internal", "Workforce Management Analyst", "Workforce Planning", None, "Day (09:00-18:00)", "Available", 32.00, "2020-10-11", "+1-555-0140", "FLR5-WFM-01"),
            ("EMP-5001", "Synthetic HR 01 (Elena Rostova)", "hr.5001@pulse-bpo.internal", "HR Generalist", "Human Resources", None, "Day (09:00-18:00)", "Available", 28.50, "2022-01-10", "+1-555-0150", "FLR5-HR-03"),
        ]

        cursor.executemany("""
            INSERT INTO employees (id, full_name, email, role, department, campaign_id, shift_name, status, hourly_rate, hire_date, phone, seat_number)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, synthetic_employees)

        # 3. Live Floor Records for operational monitoring
        live_floor_data = [
            ("EMP-1001", "In Call", "12m 45s", 28, 290, 4.8, 97.4),
            ("EMP-1002", "Available", "03m 12s", 31, 315, 4.6, 95.0),
            ("EMP-1003", "Wrap Up", "01m 20s", 26, 340, 4.4, 91.2),
            ("EMP-1004", "In Call", "07m 50s", 22, 280, 4.9, 98.2),
            ("EMP-1005", "Break", "09m 10s", 19, 230, 4.7, 89.5),
            ("EMP-1006", "Available", "05m 30s", 34, 210, 4.9, 99.1),
            ("EMP-1007", "In Call", "14m 02s", 25, 255, 4.8, 96.0),
            ("EMP-1008", "Available", "02m 40s", 42, 175, 4.2, 94.3),
            ("EMP-1009", "Training", "45m 00s", 12, 190, 4.1, 92.0),
            ("EMP-1010", "Available", "04m 15s", 20, 390, 4.7, 96.5),
            ("EMP-1011", "In Call", "08m 33s", 24, 405, 4.8, 95.8),
            ("EMP-1012", "Offline", "3h 10m", 0, 0, 0.0, 0.0),
        ]
        cursor.executemany("""
            INSERT INTO live_floor (employee_id, current_state, state_started_at, calls_handled_today, avg_handle_time_sec, csat_score, adherence_percent)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, live_floor_data)

        # 4. Roster (7 Days for agents)
        today = datetime.now()
        shift_patterns = ["MOR", "MOR", "MOR", "MOR", "MOR", "OFF", "OFF"]
        shift_times = {
            "MOR": ("06:00", "15:00"),
            "DAY": ("14:00", "23:00"),
            "GRA": ("22:00", "07:00"),
            "SPL": ("10:00", "19:00"),
            "OFF": ("-", "-")
        }

        roster_entries = []
        for emp in synthetic_employees[:12]:
            emp_id = emp[0]
            # determine baseline code based on shift_name
            if "Morning" in emp[6]:
                code = "MOR"
            elif "Day" in emp[6]:
                code = "DAY"
            elif "Night" in emp[6]:
                code = "GRA"
            else:
                code = "MOR"

            for day_offset in range(7):
                s_date = (today + timedelta(days=day_offset)).strftime("%Y-%m-%d")
                # 6th and 7th day off
                day_code = "OFF" if day_offset in [5, 6] else code
                st, et = shift_times[day_code]
                swap = "Requested" if (emp_id == "EMP-1003" and day_offset == 2) else "None"
                roster_entries.append((emp_id, s_date, day_code, st, et, swap))

        cursor.executemany("""
            INSERT INTO roster (employee_id, shift_date, shift_code, start_time, end_time, swap_status)
            VALUES (?, ?, ?, ?, ?, ?)
        """, roster_entries)

        # 5. Attendance (Today & past 3 days)
        attendance_entries = []
        for offset in range(3, -1, -1):
            w_date = (today - timedelta(days=offset)).strftime("%Y-%m-%d")
            for emp in synthetic_employees[:12]:
                emp_id = emp[0]
                if emp_id == "EMP-1012" and offset == 0:
                    status = "Absent"
                    p_in = None
                    p_out = None
                    hrs = 0
                    ot = 0
                elif emp_id == "EMP-1005" and offset == 1:
                    status = "Late"
                    p_in = "14:24"
                    p_out = "23:00"
                    hrs = 8.6
                    ot = 0
                else:
                    status = "Present"
                    p_in = "06:02" if "Morning" in emp[6] else ("14:01" if "Day" in emp[6] else "22:00")
                    p_out = "15:05" if "Morning" in emp[6] else ("23:02" if "Day" in emp[6] else "07:03")
                    hrs = 9.0
                    ot = 0.5 if emp_id in ["EMP-1001", "EMP-1006"] else 0.0

                attendance_entries.append((emp_id, w_date, p_in, p_out, hrs, ot, status))

        cursor.executemany("""
            INSERT INTO attendance (employee_id, work_date, punch_in, punch_out, total_hours, overtime_hours, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, attendance_entries)

        # 6. Quality Assurance (QA) Evaluations (Scorecards)
        qa_data = [
            ("CALL-SYNTH-8801", "EMP-1001", "Synthetic QA Samira Hayes", (today - timedelta(days=1)).strftime("%Y-%m-%d"), 15.0, 25.0, 34.0, 25.0, 0, 99.0, "Excellent active listening and empathy during technical troubleshooting. Customer expressed high satisfaction."),
            ("CALL-SYNTH-8802", "EMP-1002", "Synthetic QA Samira Hayes", (today - timedelta(days=1)).strftime("%Y-%m-%d"), 14.0, 22.0, 31.0, 25.0, 0, 92.0, "Good hold protocol followed. Suggested reviewing step 3 of the knowledge base for faster diagnosis."),
            ("CALL-SYNTH-8803", "EMP-1003", "Synthetic QA Samira Hayes", (today - timedelta(days=2)).strftime("%Y-%m-%d"), 12.0, 18.0, 28.0, 24.0, 0, 82.0, "AHT was slightly elevated. Work on transition phrases during hold times to maintain customer rapport."),
            ("CALL-SYNTH-8804", "EMP-1006", "Synthetic QA Robin Diaz", (today - timedelta(days=2)).strftime("%Y-%m-%d"), 15.0, 25.0, 35.0, 25.0, 0, 100.0, "Flawless identity authentication protocol under high-risk fraud simulation. Exemplary adherence."),
            ("CALL-SYNTH-8805", "EMP-1007", "Synthetic QA Robin Diaz", (today - timedelta(days=3)).strftime("%Y-%m-%d"), 14.0, 24.0, 33.0, 25.0, 0, 96.0, "Calm, assertive, and compliant with privacy disclosure rules."),
            ("CALL-SYNTH-8806", "EMP-1008", "Synthetic QA Samira Hayes", (today - timedelta(days=3)).strftime("%Y-%m-%d"), 13.0, 20.0, 30.0, 22.0, 0, 85.0, "Correct tone of voice and positive language in chat responses."),
            ("CALL-SYNTH-8807", "EMP-1010", "Synthetic QA Robin Diaz", (today - timedelta(days=4)).strftime("%Y-%m-%d"), 15.0, 24.0, 34.0, 25.0, 0, 98.0, "Claims documentation completed accurately in one-touch resolution."),
        ]
        cursor.executemany("""
            INSERT INTO qa_evaluations (call_id, employee_id, auditor_name, evaluation_date, greeting_score, empathy_score, accuracy_score, compliance_score, fatal_error, total_score, feedback_notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, qa_data)

        # 7. Leave Requests
        leave_data = [
            ("EMP-1003", "Sick Leave", (today + timedelta(days=3)).strftime("%Y-%m-%d"), (today + timedelta(days=4)).strftime("%Y-%m-%d"), "Medical dental appointment (synthetic demo)", "Pending"),
            ("EMP-1005", "Casual Leave", (today + timedelta(days=10)).strftime("%Y-%m-%d"), (today + timedelta(days=12)).strftime("%Y-%m-%d"), "Personal family event", "Approved"),
            ("EMP-1008", "Comp-off", (today + timedelta(days=5)).strftime("%Y-%m-%d"), (today + timedelta(days=5)).strftime("%Y-%m-%d"), "Shift replacement compensatory off", "Approved"),
            ("EMP-1011", "Casual Leave", (today + timedelta(days=8)).strftime("%Y-%m-%d"), (today + timedelta(days=9)).strftime("%Y-%m-%d"), "Annual leave travel schedule", "Pending"),
        ]
        cursor.executemany("""
            INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason, status)
            VALUES (?, ?, ?, ?, ?, ?)
        """, leave_data)

        # 8. Payroll & Shift Allowances
        # Night differential (15% rate on graveyard hours) + BPO quality bonus
        payroll_data = [
            ("EMP-1001", "Cycle-Nov-A", 160.0, 0.0, 8.0, 3600.0, 0.0, 250.0, 180.0, 3670.0, "Processed"),
            ("EMP-1002", "Cycle-Nov-A", 160.0, 0.0, 0.0, 2880.0, 0.0, 150.0, 144.0, 2886.0, "Processed"),
            ("EMP-1006", "Cycle-Nov-A", 160.0, 80.0, 10.0, 4160.0, 312.0, 350.0, 220.0, 4602.0, "Processed"),
            ("EMP-1007", "Cycle-Nov-A", 160.0, 80.0, 4.0, 3680.0, 276.0, 300.0, 195.0, 4061.0, "Processed"),
            ("EMP-1004", "Cycle-Nov-A", 160.0, 24.0, 2.0, 3840.0, 86.4, 280.0, 205.0, 4001.4, "Draft"),
            ("EMP-1010", "Cycle-Nov-A", 160.0, 0.0, 0.0, 3200.0, 0.0, 200.0, 160.0, 3240.0, "Draft"),
        ]
        cursor.executemany("""
            INSERT INTO payroll_records (employee_id, pay_period, base_hours, night_diff_hours, overtime_hours, base_salary, night_allowance, quality_incentive, deductions, net_pay, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, payroll_data)

        print("Database seeded with synthetic BPO and HRMS data successfully.")

