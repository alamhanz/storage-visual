import random
import uuid

import pandas as pd


def generate_totes_with_fixed_colors(csv_file_path, num_totes=80):
    """
    Generates a DataFrame with randomly assigned Totes to unique Storage IDs from a CSV file,
    including a random color from a fixed list for each Tote.

    Parameters:
    - csv_file_path: Path to the CSV file containing the Storage IDs.
    - num_totes: Number of Totes to generate.

    Returns:
    - DataFrame with Tote_ID, Storage_ID, and Color columns.
    """
    # Read the storage IDs from the CSV file
    storage_list = pd.read_csv(csv_file_path)
    storage_ids = storage_list["storage_id"].unique()

    # Ensure the number of totes does not exceed the number of storage IDs
    if num_totes > len(storage_ids):
        raise ValueError("Number of totes cannot exceed the number of storage IDs.")

    # Create random Totes with unique IDs
    totes = [str(uuid.uuid4()) for _ in range(num_totes)]

    # List of fixed colors to choose from
    color_list = ["#FF5733", "#33FF57", "#3357FF", "#F0FF33"]  # Example colors

    # Randomly assign each Tote to a unique Storage ID and a color from the list
    random.shuffle(storage_ids)  # Shuffle the storage IDs to randomize assignment

    assigned_totes = {
        "tote_id": totes,
        "storage_id": storage_ids[:num_totes],
        "color": [random.choice(color_list) for _ in range(num_totes)],
    }

    # Convert the dictionary to a DataFrame
    totes_df = pd.DataFrame(assigned_totes)

    return totes_df


# Example usage with the CSV file path
csv_file_path = "storage_list.csv"  # Replace with your actual file path
totes_df = generate_totes_with_fixed_colors(csv_file_path, num_totes=80)

# Save the DataFrame to a CSV file
totes_df.to_csv("assigned_totes.csv", index=False)
