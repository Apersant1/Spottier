from .schemas import SpotCreate


def create_spot(spot: SpotCreate) -> SpotCreate:
    """
        Create spot
    :rtype: SpotCreate
    """
    spot: SpotCreate = SpotCreate(
        name = spot.name,
        desc = spot.desc,
        position = spot.position,
        registered_at = spot.registered_at
    )
    return spot
