import json

def serialize(obj, seen=None):
    if seen is None:
        seen = set()
    obj_id = id(obj)

    if obj_id in seen:
        # Circular reference detected; return a reference placeholder
        return "<circular reference>"
    
    seen = seen.copy()
    # Mark the current object as seen
    seen.add(obj_id)

    # Handle basic data types
    if isinstance(obj, (str, int, float, bool, type(None))):
        return obj

    # Handle sets
    elif isinstance(obj, set):
        return [serialize(item, seen) for item in obj]

    # Handle lists and tuples
    elif isinstance(obj, (list, tuple)):
        return [serialize(item, seen) for item in obj]

    # Handle dictionaries
    elif isinstance(obj, dict):
        return {str(key): serialize(value, seen) for key, value in obj.items()}

    # Handle functions
    elif callable(obj):
        name = obj.__name__ if hasattr(obj, '__name__') else '(anonymous)'
        return f"<function {name}>"

    # Handle custom objects
    elif hasattr(obj, '__dict__'):
        result = {}
        # Recursively serialize object attributes
        for key, value in obj.__dict__.items():
            result[str(key)] = serialize(value, seen)
        return result

    # Fallback for other types
    else:
        return str(obj)

def marshall_to_json(msg: any) -> str:
    serializable_obj = serialize(msg)
    return json.dumps(serializable_obj)
