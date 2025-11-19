'''
Business: API для работы с записями дневника эмоций
Args: event - dict with httpMethod, body, queryStringParameters
      context - object with attributes: request_id, function_name
Returns: HTTP response dict
'''

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        if method == 'GET':
            conn = get_db_connection()
            cur = conn.cursor()
            
            cur.execute('''
                SELECT id, mood, emoji, note, created_at
                FROM mood_entries
                ORDER BY created_at DESC
                LIMIT 30
            ''')
            
            entries = cur.fetchall()
            cur.close()
            conn.close()
            
            result = []
            for entry in entries:
                result.append({
                    'id': str(entry['id']),
                    'mood': entry['mood'],
                    'emoji': entry['emoji'],
                    'note': entry['note'] or '',
                    'date': entry['created_at'].isoformat()
                })
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'entries': result}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            mood = body_data.get('mood', '').strip()
            emoji = body_data.get('emoji', '').strip()
            note = body_data.get('note', '').strip()
            
            if not mood or not emoji:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Mood and emoji are required'}),
                    'isBase64Encoded': False
                }
            
            conn = get_db_connection()
            cur = conn.cursor()
            
            cur.execute('''
                INSERT INTO mood_entries (mood, emoji, note)
                VALUES (%s, %s, %s)
                RETURNING id, mood, emoji, note, created_at
            ''', (mood, emoji, note))
            
            entry = cur.fetchone()
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'id': str(entry['id']),
                    'mood': entry['mood'],
                    'emoji': entry['emoji'],
                    'note': entry['note'] or '',
                    'date': entry['created_at'].isoformat()
                }),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
