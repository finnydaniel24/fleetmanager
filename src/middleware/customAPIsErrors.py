class customApiError(Exception):
    def __init__(self, errorMessage, statusCode):
        self.message = errorMessage
        self.message = self.message+"+"+str(statusCode)

    def __str__(self):
        return (repr(self.message))