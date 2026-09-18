"""Seed Demo Dataset for CivicFlow (Member 6 specification).
Populates 20+ realistic demo complaints with duplicate clusters, high-priority cases,
and low-confidence manual review cases.
"""
import datetime
from sqlalchemy.orm import Session
from backend.models import Complaint
from backend.services.classifier import classify_complaint
from backend.services.entities import extract_entities
from backend.services.priority import calculate_priority

INITIAL_SEEDS = [
    # Demo 1: High Priority Flagship Demo Complaint (School + Sewage + 3 days)
    {
        "id": "C1001",
        "complaint_text": "Sewage has been overflowing near St Mary School for three days, students cannot enter.",
        "latitude": 27.4925,
        "longitude": 77.6738,
        "status": "Pending"
    },
    # Demo 2: Cluster CL-01 (Krishna Nagar Pothole - Report 1)
    {
        "id": "C1002",
        "complaint_text": "There is a large dangerous pothole near Krishna Nagar market for 3 days causing vehicle accidents.",
        "latitude": 27.4950,
        "longitude": 77.6740,
        "status": "Pending"
    },
    # Demo 3: Cluster CL-01 (Krishna Nagar Pothole - Report 2)
    {
        "id": "C1003",
        "complaint_text": "Deep crater on road outside Krishna Nagar market, two wheelers skidding constantly.",
        "latitude": 27.4952,
        "longitude": 77.6743,
        "status": "In Progress"
    },
    # Demo 4: Cluster CL-01 (Krishna Nagar Pothole - Report 3)
    {
        "id": "C1004",
        "complaint_text": "Massive pothole right in front of shop number 12 Krishna Nagar market.",
        "latitude": 27.4951,
        "longitude": 77.6741,
        "status": "Pending"
    },
    # Demo 5: Water Pipeline Burst
    {
        "id": "C1005",
        "complaint_text": "Main drinking water supply pipeline burst near Civil Lines water tank, thousands of liters wasting since morning.",
        "latitude": 27.5010,
        "longitude": 77.6800,
        "status": "In Progress"
    },
    # Demo 6: Electrical Sparking Live Wire
    {
        "id": "C1006",
        "complaint_text": "Live electric wire hanging from transformer sparking continuously near Sector 62 metro station.",
        "latitude": 27.4880,
        "longitude": 77.6690,
        "status": "Pending"
    },
    # Demo 7: Low-Confidence Manual Review Case (Ambiguous query)
    {
        "id": "C1007",
        "complaint_text": "Something is smelling very weird and disturbing near the corner pillar since yesterday.",
        "latitude": 27.4930,
        "longitude": 77.6710,
        "status": "Manual Review"
    },
    # Demo 8: Garbage Dump
    {
        "id": "C1008",
        "complaint_text": "Rotting garbage dump piling up outside community health clinic in Lajpat Nagar for 5 days.",
        "latitude": 27.4975,
        "longitude": 77.6765,
        "status": "Pending"
    },
    # Demo 9: Traffic Gridlock & Malfunctioning Signal
    {
        "id": "C1009",
        "complaint_text": "Traffic lights completely dead at MG Road junction causing total gridlock for 2 hours.",
        "latitude": 27.4910,
        "longitude": 77.6780,
        "status": "In Progress"
    },
    # Demo 10: Dark Street / Non-functional Lights
    {
        "id": "C1010",
        "complaint_text": "All street lights broken from Gate 2 to Gate 5 in Indiranagar, complete darkness at night.",
        "latitude": 27.5030,
        "longitude": 77.6650,
        "status": "Pending"
    },
    # Demo 11: Parks - Falling Tree
    {
        "id": "C1011",
        "complaint_text": "Huge dead tree branch fell down blocking children play area in Gandhi Public Park.",
        "latitude": 27.4990,
        "longitude": 77.6720,
        "status": "Resolved"
    },
    # Demo 12: Contaminated Drinking Water
    {
        "id": "C1012",
        "complaint_text": "Black muddy drinking water coming from tap in Rohini Sector 15 for 4 days.",
        "latitude": 27.5060,
        "longitude": 77.6820,
        "status": "Pending"
    },
    # Demo 13: Open Manhole Cover
    {
        "id": "C1013",
        "complaint_text": "Dangerous open manhole without cover on main pedestrian walkway near City Hospital.",
        "latitude": 27.4895,
        "longitude": 77.6755,
        "status": "Pending"
    },
    # Demo 14: Illegal Commercial Parking
    {
        "id": "C1014",
        "complaint_text": "Heavy commercial trucks parked illegally blocking residential gate in DLF Phase 3.",
        "latitude": 27.4940,
        "longitude": 77.6850,
        "status": "Pending"
    },
    # Demo 15: Resolved Pothole Case
    {
        "id": "C1015",
        "complaint_text": "Road repaired and asphalt leveled near Central Avenue after previous notification.",
        "latitude": 27.4850,
        "longitude": 77.6700,
        "status": "Resolved"
    }
]

def seed_database(db: Session, force: bool = False):
    """Seed initial demo complaints into the database if empty."""
    existing_count = db.query(Complaint).count()
    if existing_count > 0 and not force:
        return

    print(f"Seeding database with {len(INITIAL_SEEDS)} realistic demo complaints...")
    
    # Pre-cluster duplicate group for C1002, C1003, C1004
    cluster_mapping = {
        "C1002": ("CL-001", ["C1003", "C1004"]),
        "C1003": ("CL-001", ["C1002", "C1004"]),
        "C1004": ("CL-001", ["C1002", "C1003"])
    }

    for item in INITIAL_SEEDS:
        c_id = item["id"]
        text = item["complaint_text"]

        # Run pipeline
        cls_res = classify_complaint(text)
        dept = cls_res["department"]
        dept_conf = cls_res["department_confidence"]
        issue = cls_res["issue_type"]
        issue_conf = cls_res["issue_confidence"]

        ent_res = extract_entities(text)
        loc = ent_res["locality"]
        dur = ent_res["duration_text"]

        prio_res = calculate_priority(text, issue, dur, loc)
        prio_score = prio_res["priority_score"]
        prio_level = prio_res["priority_level"]
        prio_reasons = prio_res["priority_reasons"]

        cluster_id = None
        matched_ids = []
        if c_id in cluster_mapping:
            cluster_id, matched_ids = cluster_mapping[c_id]

        status = item["status"]
        if dept_conf < 0.60 and status != "Resolved":
            status = "Manual Review"

        complaint = Complaint(
            id=c_id,
            complaint_text=text,
            department=dept,
            issue_type=issue,
            department_confidence=dept_conf,
            issue_confidence=issue_conf,
            priority_score=prio_score,
            priority_level=prio_level,
            priority_reasons=prio_reasons,
            locality=loc,
            duration_text=dur,
            latitude=item.get("latitude"),
            longitude=item.get("longitude"),
            duplicate_cluster_id=cluster_id,
            matched_complaint_ids=matched_ids,
            status=status,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=(int(c_id[1:]) % 24))
        )
        db.merge(complaint)

    db.commit()
    print("Database seeding completed successfully.")
