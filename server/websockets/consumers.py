# websockets/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class AnalyticsConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add(
            'analytics',
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            'analytics',
            self.channel_name
        )

    async def new_response(self, event):
        await self.send(text_data=json.dumps({
            'type': 'new_response',
            'data': event['message']
        }))