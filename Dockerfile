FROM nginx:alpine

# Copy all files from the current directory to the nginx html directory
COPY . /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# The default command of the nginx:alpine image starts the nginx server,
# so we don't need to specify a CMD here.
