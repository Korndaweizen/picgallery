pkg load statistics

tmp= [291.16
292.48
292.41
292.23
289.64
281.20
292.53
290.22
292.95
292.64]

[M,C]=nanmeanConfInt(tmp, 0.95, 1)
