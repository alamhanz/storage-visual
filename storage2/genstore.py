import random
import string

import numpy as np
import pandas as pd


def GenerateStorage(filename: str, rows: int, columns: int, level: int, sections: int):
    # Define possible color codes
    # color_codes = [
    #     "#FF5733",
    #     "#33FF57",
    #     "#3357FF",
    #     "#FFFF33",
    #     "#FF33FF",
    #     "#33FFFF",
    #     "#FFA533",
    # ]

    # Generate indices
    row_idx, col_idx, lvl_idx, sec_idx = np.indices((rows, columns, level, sections))

    # Convert column indices to letters
    col_letters = [string.ascii_uppercase[col] for col in col_idx.ravel()]

    # Flatten the arrays and create the Storage IDs
    storage_ids = [
        f"storage{sec+1}-{row+1}{col_letter}_{lvl+1}"
        for row, col_letter, lvl, sec in zip(
            row_idx.ravel(), col_letters, lvl_idx.ravel(), sec_idx.ravel()
        )
    ]

    # Randomly select color codes
    # color_codes = random.choices(color_codes, k=len(storage_ids))

    # Section numbers are just the flattened sec_idx + 1
    section_numbers = sec_idx.ravel() + 1

    # Create a DataFrame
    df = pd.DataFrame(
        {
            "storage_id": storage_ids,
            "section": section_numbers,
        }
    )

    # Save the DataFrame to a CSV file
    df.to_csv(filename, index=False)

    print(f"CSV file '{filename}' generated with {len(df)} rows.")


# Example usage
GenerateStorage("storage_list.csv", 4, 3, 5, sections=3)
