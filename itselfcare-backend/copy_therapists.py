#!/usr/bin/env python3
"""Copy therapist data from old table to new table"""

import boto3
from decimal import Decimal

def copy_therapists():
    dynamodb = boto3.resource('dynamodb', region_name='eu-north-1')
    
    old_table = dynamodb.Table('itselfcare_theraphists')
    new_table = dynamodb.Table('itselfcare_therapists')
    
    print("📋 Scanning old table...")
    response = old_table.scan()
    items = response.get('Items', [])
    
    print(f"Found {len(items)} therapists in old table")
    
    copied = 0
    for item in items:
        try:
            print(f"Copying therapist: {item.get('name', 'Unknown')} ({item.get('theraphistId', 'N/A')})")
            new_table.put_item(Item=item)
            copied += 1
        except Exception as e:
            print(f"Error copying {item.get('theraphistId', 'N/A')}: {e}")
    
    print(f"\n✅ Successfully copied {copied}/{len(items)} therapists")
    
    # Verify
    verify_response = new_table.scan()
    print(f"✅ New table now has {len(verify_response.get('Items', []))} items")

if __name__ == "__main__":
    copy_therapists()
