"""Dataset generator for CivicFlow ML and seed data."""
import os
import json
import random
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

TEMPLATES = [
    # Roads
    ("There is a large dangerous pothole near {loc} for {dur} causing vehicle accidents.", "Roads", "Pothole"),
    ("Deep crater on road outside {loc}, two wheelers skidding constantly.", "Roads", "Pothole"),
    ("Massive pothole in front of market {loc} since {dur}.", "Roads", "Pothole"),
    ("Road surface eroded and broken near {loc}, difficult to drive.", "Roads", "Damaged Road"),
    ("Tar and asphalt cracked creating hazardous bumps at {loc}.", "Roads", "Damaged Road"),
    ("Broken speed breaker without markings near {loc}.", "Roads", "Damaged Road"),
    
    # Water
    ("Main drinking water pipeline burst near {loc}, water wasting since {dur}.", "Water", "Water Leakage"),
    ("Underground pipe leaking near {loc} causing water pressure loss.", "Water", "Water Leakage"),
    ("Drinking water coming with foul smell and yellowish dirty color in {loc}.", "Water", "Contaminated Water"),
    ("Residents falling sick due to contaminated water supply in {loc}.", "Water", "Contaminated Water"),
    ("No water supply for {dur} in {loc}, please restore immediately.", "Water", "No Water Supply"),
    ("Severe water shortage in {loc} for the past {dur}.", "Water", "No Water Supply"),

    # Sanitation
    ("Huge pile of uncollected garbage rotting at {loc} for {dur}.", "Sanitation", "Garbage Dump"),
    ("Trash bins overflowing outside {loc}, stray animals scattering waste.", "Sanitation", "Garbage Dump"),
    ("Illegal dumping of commercial plastic and building debris at {loc}.", "Sanitation", "Garbage Dump"),
    ("Garbage truck has not arrived for {dur} in {loc}.", "Sanitation", "Uncollected Waste"),
    ("Dead animal carcass lying near {loc} emitting horrible stench.", "Sanitation", "Uncollected Waste"),
    
    # Electrical
    ("Street lights not working along entire road in {loc} for {dur}.", "Electrical", "Street Light"),
    ("Dark street due to fused sodium lamps near {loc} park.", "Electrical", "Street Light"),
    ("Live electric wire hanging dangerously from pole near {loc}.", "Electrical", "Open Wire / Sparking"),
    ("Transformer sparking loudly and emitting smoke near {loc}.", "Electrical", "Open Wire / Sparking"),
    ("Frequent power tripping and voltage fluctuation in {loc}.", "Electrical", "Power Outage"),
    ("Complete power outage in {loc} for {dur}.", "Electrical", "Power Outage"),

    # Sewage
    ("Sewage water overflowing from manhole flooding {loc} for {dur}.", "Sewage", "Sewage Overflow"),
    ("Underground drainage blocked, dirty sewage entering houses in {loc}.", "Sewage", "Sewage Overflow"),
    ("Open manhole cover on busy street near {loc} posing fatal hazard.", "Sewage", "Open Manhole"),
    ("Broken drain lid collapsed into gutter at {loc}.", "Sewage", "Open Manhole"),
    ("Stormwater drain clogged with plastic in {loc}.", "Sewage", "Blocked Drain"),

    # Traffic
    ("Traffic signals completely dead at {loc} junction creating massive jam.", "Traffic", "Traffic Signal Issue"),
    ("Traffic light malfunctioning and blinking red at {loc}.", "Traffic", "Traffic Signal Issue"),
    ("Severe traffic gridlock due to illegal parking in {loc}.", "Traffic", "Traffic Congestion"),
    ("Commercial delivery trucks parked illegally blocking lane at {loc}.", "Traffic", "Illegal Parking"),

    # Parks
    ("Children swing set broken with sharp rusted metal in {loc} park.", "Parks", "Damaged Equipment"),
    ("Large tree branch fell down blocking walkway in {loc} garden.", "Parks", "Tree Falling"),
    ("Overgrown grass and weeds attracting snakes in {loc} park.", "Parks", "Park Maintenance"),
    
    # Other
    ("Stray dog menace and aggressive biting incidents in {loc}.", "Other", "Animal Menace"),
    ("Excessive loudspeaker noise past midnight violating regulations in {loc}.", "Other", "Noise Pollution"),
    ("General civic grievance regarding services delay in {loc}.", "Other", "Other")
]

LOCALITIES = [
    "Krishna Nagar", "Civil Lines", "Sector 62", "MG Road", "Connaught Place",
    "Indiranagar", "Koramangala", "HSR Layout", "Salt Lake", "Jubilee Hills",
    "Bandra West", "Andheri East", "Lajpat Nagar", "Karol Bagh", "Dwarka Sector 10",
    "Rohini Sector 15", "Janakpuri", "Vasant Kunj", "Saket", "Noida Sector 18"
]

DURATIONS = ["3 days", "2 days", "5 days", "1 week", "24 hours", "yesterday", "4 days", "a few days"]

def generate_dataset(num_samples: int = 250):
    os.makedirs(BASE_DIR, exist_ok=True)
    rows = []
    
    for i in range(num_samples):
        template, dept, issue = random.choice(TEMPLATES)
        loc = random.choice(LOCALITIES)
        dur = random.choice(DURATIONS)
        text = template.format(loc=loc, dur=dur)
        
        # Coordinates around Mathura / Delhi NCR
        lat = round(27.48 + random.uniform(0.005, 0.050), 5)
        lon = round(77.66 + random.uniform(0.005, 0.050), 5)
        
        rows.append({
            "id": f"C{1000 + i + 1}",
            "complaint_text": text,
            "department": dept,
            "issue_type": issue,
            "locality": loc,
            "duration_text": dur,
            "latitude": lat,
            "longitude": lon
        })

    df = pd.DataFrame(rows)
    
    # Save full dataset
    full_csv = os.path.join(BASE_DIR, "civicflow_complaints.csv")
    df.to_csv(full_csv, index=False)

    # Train / test split (80/20)
    train_df = df.sample(frac=0.8, random_state=42)
    test_df = df.drop(train_df.index)

    train_csv = os.path.join(BASE_DIR, "civicflow_train.csv")
    test_csv = os.path.join(BASE_DIR, "civicflow_test.csv")
    train_df.to_csv(train_csv, index=False)
    test_df.to_csv(test_csv, index=False)

    summary = {
        "total_records": len(df),
        "train_records": len(train_df),
        "test_records": len(test_df),
        "departments": df["department"].value_counts().to_dict(),
        "issue_types_count": int(df["issue_type"].nunique()),
        "localities_count": int(df["locality"].nunique())
    }

    summary_json = os.path.join(BASE_DIR, "dataset_summary.json")
    with open(summary_json, "w") as f:
        json.dump(summary, f, indent=2)

    print(f"Generated {len(df)} complaint samples.")
    print(f"Train: {len(train_df)}, Test: {len(test_df)}")

if __name__ == "__main__":
    generate_dataset()
