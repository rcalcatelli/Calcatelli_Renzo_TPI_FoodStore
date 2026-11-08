from sqlmodel import SQLModel


class MensajeRespuesta(SQLModel):
    message: str
