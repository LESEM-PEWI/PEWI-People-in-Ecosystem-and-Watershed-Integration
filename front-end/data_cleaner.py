import numpy as np
import pandas as pd
from os.path import isfile, join, dirname, realpath

dir_path = dirname(realpath(__file__))
baseDir = dirname(dir_path)
# insert file where the index.html is located
fileName = join(baseDir, 'ghgData.csv')

ExpectedColumns = {'to_carb', 'soil_type', 'ch4_kg_ha_yr', 'TopN2O', 'kpi',
                   'Whole_repsiration', 'precipitation_level', 'land_use',
                   'land_use_code'}
landUSes = {'Conservation forest',
            'Conventional forest',
            'Mixed fruits and vegetables',
            'Permanent pasture',
            'alfalfa',
            'conservationCorn',
            'conservationSoybean',
            'conventionalCorn',
            'conventionalSoybean',
            'grassHay',
            'prairie',
            'shortRotationWoodyBioenergy',
            'switchgrass'}

landUseCodes = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15}

precipitationLevels = {24.58, 28.18, 30.39, 32.16, 34.34, 36.47, 45.1, 37.}

soil = {'M', 'Q', 'A', 'O', 'C', 'N', 'B', 'L', 'K', 'D', 'G', 'Y', 'T'}


def _check_values(values, category):
    assert isinstance(category, str), "category must be a string"
    categories = ['soil', 'precipitation', 'land_use']
    categories = [i.lower() for i in categories]
    if category.lower() not in categories:
        raise ValueError(f'category should be any of of: {categories}')

    pick_category = dict(zip(categories, [soil, precipitationLevels, landUseCodes]))[category.lower()]

    assert isinstance(values,
                      (list, np.ndarray, pd.Series, tuple)), (f"Values must be a list, np.ndarray, pd.Series, "
                                                              f"or tuple. not: {type(values)}")
    uniq_vals = set(values)

    intersect = uniq_vals.intersection(pick_category)

    dif = soil.difference(pick_category)

    if len(intersect) != len(pick_category):
        raise ValueError(f"{category} is missing some treatments levels {dif}")


def view(dat_v):
    from xlwings import view
    view(dat_v, table=False)


def load_and_clean(view_in_excel=False):
    """"checks for duplicates in the data to send to the serve"""

    df = pd.read_csv('kpi.csv')
    # check if all columns are in the data frame
    interSec = df.columns.intersection(ExpectedColumns)
    Tru = [x == y for x, y in zip(interSec, ExpectedColumns)]
    print(Tru)
    if len(interSec) != len(ExpectedColumns):
        seTeXP = set(ExpectedColumns)
        dif = seTeXP.difference(df.columns)
        raise ValueError(f'Columns do not match, expected columns:{ExpectedColumns}, \nmissing{dif}')
    df['land_use'] = df['land_use'].replace({'1e-10': 'Permanent pasture'})

    if 'Unnamed: 0' in df.columns:
        df.drop('Unnamed: 0', axis=1, inplace=True)
    data = df.drop_duplicates(subset=['land_use', 'precipitation_level', 'soil_type'])
    # check precipitation
    _check_values(data.precipitation_level, category='precipitation')
    # check land use codes
    _check_values(data.land_use_code, category='land_use')
    # check soil types
    _check_values(data.soil_type, category='soil')
    data.reset_index(drop=True, inplace=True)
    data.to_csv(fileName, index=False)
    if view_in_excel:
        view(data)
    return data


if __name__ == '__main__':
    da = load_and_clean(view_in_excel=False)
