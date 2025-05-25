import redis
import json
from typing import Any, Optional
from .config import settings

# 创建Redis连接
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)


class CacheManager:
    """缓存管理器"""
    
    def __init__(self):
        self.client = redis_client
    
    async def get(self, key: str) -> Optional[Any]:
        """获取缓存值"""
        try:
            value = self.client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            print(f"Redis get error: {e}")
            return None
    
    async def set(self, key: str, value: Any, expire: int = 3600) -> bool:
        """设置缓存值"""
        try:
            serialized_value = json.dumps(value, ensure_ascii=False)
            return self.client.setex(key, expire, serialized_value)
        except Exception as e:
            print(f"Redis set error: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """删除缓存"""
        try:
            return bool(self.client.delete(key))
        except Exception as e:
            print(f"Redis delete error: {e}")
            return False
    
    async def exists(self, key: str) -> bool:
        """检查键是否存在"""
        try:
            return bool(self.client.exists(key))
        except Exception as e:
            print(f"Redis exists error: {e}")
            return False


# 全局缓存管理器实例
cache = CacheManager() 